// Generates docs/<component>.md, llms.txt and llms-full.txt from the JSDoc in
// src/components. JSDoc is the single source of truth: editors and agents read
// it on hover, these files carry the same text to agents that read the package
// or the repo instead. Run `npm run docs` after changing a component; CI fails
// if the committed output is stale.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

const root = new URL('..', import.meta.url).pathname
const componentsDir = join(root, 'src/components')
const docsDir = join(root, 'docs')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

// Components behind their own entry point because they need an optional peer.
const subpathEntries = {
  form: { from: 'turkishcoffee/form', peer: 'react-hook-form' },
  'data-table': { from: 'turkishcoffee/data-table', peer: '@tanstack/react-table' },
}

// The export a component's doc leads with, when it is not the one named after the folder.
const mainExport = { toast: 'toast' }

const pascal = (s) => s.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())

function jsDocOf(node) {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc)
  const doc = docs.at(-1)
  if (!doc) return null
  const text = ts.getTextOfJSDocComment(doc.comment) ?? ''
  const example = doc.tags?.find((t) => t.tagName.text === 'example')
  return {
    text: text.trim(),
    example: example ? (ts.getTextOfJSDocComment(example.comment) ?? '').trim() : null,
  }
}

const isExported = (node) =>
  ts.canHaveModifiers(node) &&
  ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)

function parse(file) {
  const src = readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const client = /^['"]use client['"]/.test(src.trimStart())
  const exports = []
  const variants = []
  const props = []

  const visit = (node) => {
    // cva(base, { variants: { name: { option: … } }, defaultVariants })
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(sf) === 'cva' &&
      node.arguments[1] &&
      ts.isObjectLiteralExpression(node.arguments[1])
    ) {
      const config = node.arguments[1]
      const prop = (obj, name) =>
        obj.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === name)
      const vs = prop(config, 'variants')?.initializer
      const defaults = prop(config, 'defaultVariants')?.initializer
      if (vs && ts.isObjectLiteralExpression(vs)) {
        for (const v of vs.properties) {
          if (!ts.isPropertyAssignment(v) || !ts.isObjectLiteralExpression(v.initializer)) continue
          const name = v.name.getText(sf)
          const def =
            defaults && ts.isObjectLiteralExpression(defaults)
              ? prop(defaults, name)?.initializer.getText(sf).replace(/'/g, '')
              : undefined
          variants.push({
            name,
            options: v.initializer.properties.map((o) => o.name.getText(sf).replace(/'/g, '')),
            default: def,
          })
        }
      }
    }
    // Documented props, wherever they are declared (exported prop types or inline).
    if (ts.isPropertySignature(node)) {
      const doc = jsDocOf(node)
      if (doc) {
        props.push({
          name: node.name.getText(sf) + (node.questionToken ? '?' : ''),
          type: node.type?.getText(sf).replace(/\s+/g, ' ') ?? 'unknown',
          doc: doc.text.replace(/\s+/g, ' '),
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  for (const stmt of sf.statements) {
    if (!isExported(stmt)) continue
    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      exports.push({ name: stmt.name.text, kind: 'value', doc: jsDocOf(stmt) })
    } else if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        exports.push({ name: d.name.getText(sf), kind: 'value', doc: jsDocOf(stmt) })
      }
    } else if (ts.isTypeAliasDeclaration(stmt)) {
      exports.push({ name: stmt.name.text, kind: 'type', doc: jsDocOf(stmt) })
    }
  }
  return { client, exports, variants, props }
}

function component(dir) {
  const files = readdirSync(join(componentsDir, dir))
    .filter((f) => /\.tsx?$/.test(f) && !/\.(stories|test)\.tsx?$/.test(f) && f !== 'index.ts')
    .sort((a, b) => (a.startsWith(`${dir}.`) ? -1 : b.startsWith(`${dir}.`) ? 1 : a.localeCompare(b)))
  const parts = files.map((f) => parse(join(componentsDir, dir, f)))
  const title = pascal(dir)
  const exports = parts.flatMap((p) => p.exports)
  const main = exports.find((e) => e.name === (mainExport[dir] ?? title))
  return {
    dir,
    title,
    client: parts[0].client,
    entry: subpathEntries[dir],
    main,
    exports,
    variants: parts.flatMap((p) => p.variants),
    props: parts.flatMap((p) => p.props),
  }
}

function summary(text) {
  // First sentence, for indexes.
  const flat = text.replace(/\s+/g, ' ')
  return flat.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? flat
}

function render(c) {
  const from = c.entry?.from ?? 'turkishcoffee'
  const values = c.exports.filter((e) => e.kind === 'value').map((e) => e.name)
  const types = c.exports.filter((e) => e.kind === 'type').map((e) => e.name)
  const imports = [...values, ...types.map((t) => `type ${t}`)]
  const out = [`# ${c.title}`, '']

  out.push(
    c.client
      ? '**Client component** (`"use client"`): safe to import from a server component, but it renders on the client.'
      : '**Server-renderable**: no `"use client"`; it adds no client boundary.',
  )
  if (c.entry) {
    out.push('', `Needs the optional peer \`${c.entry.peer}\`. It is **not** exported from the root \`turkishcoffee\` entry.`)
  }
  out.push('', '```tsx', `import { ${imports.join(', ')} } from '${from}'`, '```', '')

  if (c.main?.doc) out.push(c.main.doc.text, '')
  if (c.main?.doc?.example) out.push('## Example', '', '```tsx', c.main.doc.example, '```', '')

  if (c.variants.length) {
    out.push('## Variants', '', '| Prop | Options | Default |', '|---|---|---|')
    for (const v of c.variants) {
      out.push(`| \`${v.name}\` | ${v.options.map((o) => `\`${o}\``).join(' · ')} | ${v.default ? `\`${v.default}\`` : '—'} |`)
    }
    out.push('')
  }

  if (c.props.length) {
    out.push('## Props', '', 'Only props this library adds or changes; everything else forwards to the underlying element or Radix primitive.', '')
    for (const p of c.props) out.push(`- \`${p.name}: ${p.type}\` — ${p.doc}`)
    out.push('')
  }

  const others = c.exports.filter((e) => e !== c.main)
  if (others.length) {
    out.push('## Parts', '')
    for (const e of others) {
      const doc = e.doc ? ` — ${e.doc.text.replace(/\s+/g, ' ')}` : ''
      out.push(`- \`${e.kind === 'type' ? `type ${e.name}` : e.name}\`${doc}`)
      if (e.doc?.example) out.push('', '  ```tsx', ...e.doc.example.split('\n').map((l) => `  ${l}`), '  ```', '')
    }
    out.push('')
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

const components = readdirSync(componentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
  .map(component)

const undocumented = components.filter((c) => !c.main?.doc)
if (undocumented.length) {
  console.error(`Missing root JSDoc: ${undocumented.map((c) => c.dir).join(', ')}`)
  process.exit(1)
}

if (existsSync(docsDir)) rmSync(docsDir, { recursive: true })
mkdirSync(docsDir)
const rendered = components.map((c) => {
  const md = render(c)
  writeFileSync(join(docsDir, `${c.dir}.md`), md)
  return md
})

const index = (link) =>
  components
    .map((c) => `- [${c.title}](${link(c)}): ${summary(c.main.doc.text)}${c.entry ? ` (\`${c.entry.from}\`)` : ''}`)
    .join('\n')

const repo = 'https://github.com/gorkemkaramolla/turkishcoffee/blob/main'
writeFileSync(
  join(root, 'llms.txt'),
  `# turkishcoffee

> ${pkg.description} shadcn-shaped (Radix + cva + \`cn()\`), but with its own
> API in places — read AGENTS.md before writing code with it.

Installed copies ship these files: \`node_modules/turkishcoffee/AGENTS.md\` and
\`node_modules/turkishcoffee/docs/<component>.md\`.

## Docs

- [AGENTS.md](${repo}/AGENTS.md): setup, import map, differences from shadcn, rules
- [llms-full.txt](${repo}/llms-full.txt): AGENTS.md and every component doc in one file

## Components

${index((c) => `${repo}/docs/${c.dir}.md`)}
`,
)

// AGENTS.md is hand-written except for the component index between the markers.
const agentsPath = join(root, 'AGENTS.md')
const agents = readFileSync(agentsPath, 'utf8').replace(
  /(<!-- components:start -->\n)[\s\S]*?(<!-- components:end -->)/,
  (_, start, end) =>
    `${start}${components
      .map(
        (c) =>
          `- [${c.title}](docs/${c.dir}.md) · ${c.client ? 'client' : 'server'}${c.entry ? ` · \`${c.entry.from}\`` : ''} — ${summary(c.main.doc.text)}`,
      )
      .join('\n')}\n${end}`,
)
writeFileSync(agentsPath, agents)
writeFileSync(join(root, 'llms-full.txt'), [agents.trimEnd(), ...rendered.map((m) => m.trimEnd())].join('\n\n---\n\n') + '\n')

console.log(`docs: ${components.length} components → docs/, llms.txt, llms-full.txt`)
