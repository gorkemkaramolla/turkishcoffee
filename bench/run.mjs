// DataTable benchmark: builds bench/ in production mode, serves it, and drives
// each scenario in headless Chromium. Every scenario runs in a fresh page,
// RUNS times; the median is reported.
//
//   pnpm bench                          # print the results
//   pnpm bench --ab bench/.baseline/src # A/B against another copy of src/, interleaved
//   pnpm bench --save base              # also write bench/results/base.json
//   pnpm bench --compare base           # print the change against a saved run
//   pnpm bench --only wide --runs 3     # one scenario, fewer runs
//   pnpm bench --cpu 4                  # throttle the CPU 4x (a mid-range laptop)
//
// `busy ms` is the main thread's work for a step (Chrome's TaskDuration):
// scripting, style, layout. `render ms` is React's commit time (Profiler).
// `wall ms` also waits for two frames, so it moves in steps of a frame. An
// A/B run alternates the two builds run by run, so both see the same machine
// load; across separate runs treat differences under ~10% as noise. Not a CI gate.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { build, preview } from 'vite'
import { chromium } from 'playwright'

const dir = import.meta.dirname
const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? undefined : args[index + 1]
}
const RUNS = Number(flag('runs') ?? 7)
const CPU = Number(flag('cpu') ?? 1)
const only = flag('only')?.split(',')

// Each scenario: a page, and the actions run in order on it (mount first).
const scenarios = Object.fromEntries(
  Object.entries({
    client10k: ['mount', 'sort', 'sortNumber', 'filter', 'clearFilter', 'selectAll', 'toggleRow', 'refresh', 'resize', 'scroll'],
    wide: ['mount', 'scrollX', 'scroll', 'resize'],
    small: ['mount', 'sort', 'selectAll', 'refresh'],
  }).filter(([name]) => !only || only.includes(name)),
)

const variants = [{ name: 'current', src: undefined }]
if (flag('ab')) variants.push({ name: 'baseline', src: resolve(flag('ab')) })

const configFile = join(dir, 'vite.config.ts')
for (const [index, variant] of variants.entries()) {
  variant.outDir = `dist/${variant.name}`
  if (variant.src) process.env.BENCH_SRC = variant.src
  else delete process.env.BENCH_SRC
  process.env.BENCH_OUT = variant.outDir
  await build({ configFile })
  variant.server = await preview({ configFile, build: { outDir: variant.outDir }, preview: { port: 4179 + index, strictPort: true } })
  variant.url = variant.server.resolvedUrls.local[0]
}

const browser = await chromium.launch()

async function sample(variant, scenario, steps) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const cdp = await page.context().newCDPSession(page)
  if (CPU > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU })
  await cdp.send('Performance.enable')
  // Main-thread time by kind, from Chrome itself.
  const metrics = async () => {
    const { metrics: list } = await cdp.send('Performance.getMetrics')
    const get = (name) => (list.find((m) => m.name === name)?.value ?? 0) * 1000
    return { task: get('TaskDuration'), style: get('RecalcStyleDuration'), layout: get('LayoutDuration') }
  }
  await page.goto(`${variant.url}?s=${scenario}`)
  await page.waitForFunction(() => window.bench)
  const out = {}
  for (const step of steps) {
    const before = await metrics()
    const result = await page.evaluate((s) => window.bench.run(s), step)
    const after = await metrics()
    out[step] = {
      ...result,
      task: after.task - before.task,
      style: after.style - before.style,
      layout: after.layout - before.layout,
    }
  }
  await page.close()
  return out
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}
const round = (value) => Math.round(value * 10) / 10

const results = Object.fromEntries(variants.map((variant) => [variant.name, {}]))
for (const [scenario, steps] of Object.entries(scenarios)) {
  const samples = Object.fromEntries(variants.map((variant) => [variant.name, []]))
  for (let run = 0; run < RUNS; run++) {
    // Alternate which build goes first, so neither always runs on a warmer machine.
    const order = run % 2 ? [...variants].reverse() : variants
    for (const variant of order) samples[variant.name].push(await sample(variant, scenario, steps))
  }
  for (const variant of variants) {
    for (const step of steps) {
      const all = samples[variant.name].map((run) => run[step])
      results[variant.name][`${scenario}.${step}`] = {
        ms: round(median(all.map((s) => s.task))),
        wallMs: round(median(all.map((s) => s.total))),
        renderMs: round(median(all.map((s) => s.render))),
        styleMs: round(median(all.map((s) => s.style))),
        layoutMs: round(median(all.map((s) => s.layout))),
        commits: median(all.map((s) => s.commits)),
        longTasks: median(all.map((s) => s.longTasks)),
        nodes: median(all.map((s) => s.nodes)),
      }
    }
  }
}

await browser.close()
for (const variant of variants) variant.server.httpServer.close()

const pct = (now, was) => (was ? `${now >= was ? '+' : ''}${Math.round(((now - was) / was) * 100)}%` : '')
const current = results.current
const compareName = flag('compare')
const base = variants.length > 1
  ? results.baseline
  : compareName && existsSync(join(dir, 'results', `${compareName}.json`))
    ? JSON.parse(readFileSync(join(dir, 'results', `${compareName}.json`), 'utf8'))
    : null

console.log(
  `DataTable benchmark · ${RUNS} runs · CPU ${CPU}x${variants.length > 1 ? ' · A/B vs baseline' : compareName ? ` · vs ${compareName}` : ''}`,
)
console.table(
  Object.entries(current).map(([name, r]) => {
    const b = base?.[name]
    return {
      step: name,
      'busy ms': r.ms,
      ...(b ? { was: b.ms, 'Δ busy': pct(r.ms, b.ms) } : {}),
      'render ms': r.renderMs,
      ...(b ? { 'Δ render': pct(r.renderMs, b.renderMs) } : {}),
      'style ms': r.styleMs,
      ...(b ? { 'Δ style': pct(r.styleMs, b.styleMs) } : {}),
      'layout ms': r.layoutMs,
      commits: b ? `${r.commits} (was ${b.commits})` : r.commits,
      'wall ms': r.wallMs,
      'DOM nodes': r.nodes,
    }
  }),
)

const saveName = flag('save')
if (saveName) {
  mkdirSync(join(dir, 'results'), { recursive: true })
  writeFileSync(join(dir, 'results', `${saveName}.json`), `${JSON.stringify(current, null, 2)}\n`)
  console.log(`saved bench/results/${saveName}.json`)
}
