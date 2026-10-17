import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { cssAttributeValue } from '../../../lib/css'
import { inlineScroll, mirrorHeader, setInlineScroll } from './scroll'

/** A header drag in progress. Only which column: the motion never goes through React. */
export type ColumnDrag = { columnId: string }

/** Pointer travel before a press becomes a drag, so a plain click still sorts. */
const THRESHOLD = 4
/** Width of the band at each edge that scrolls the grid: 96px, or 15% of narrow grids. */
const EDGE = 96
/** Auto-scroll speed in px/s: slow at the band's inner border, fast at (or past) the edge. */
const MIN_SPEED = 200
const MAX_SPEED = 2400
/** Holding still in the band speeds the scroll up, to this many times, over this long. */
const MAX_BOOST = 4
const BOOST_MS = 1500

type Slot = { id: string; left: number; right: number; fixed: boolean }

/** How long the columns take to glide into place after the release. */
const SETTLE_MS = 150
/** The cells' easing (Tailwind's ease-out), so everything glides as one. */
const EASE_OUT = 'var(--ease-out, cubic-bezier(0, 0, 0.2, 1))'

/**
 * Drag-to-reorder for header cells, on pointer events (no drag-and-drop
 * library). The dragged column — header and cells — follows the pointer, and
 * the columns it passes over slide the other way in step with it: a neighbour
 * it covers by 30% has moved 30% of the way, so the two trade places
 * continuously instead of snapping at the midpoint. A dashed outline marks
 * where it will land, sliding to each new slot. Releasing past a column's
 * half drops it there: everything glides the rest of the way, then the new
 * order is committed (`onDrop(columnId, beforeId)`). Escape glides back.
 * Touch input is ignored so it can scroll the grid; the header menu's Move
 * left/right is the touch and keyboard path.
 *
 * React renders twice per drag (start and end). Everything in between —
 * following the pointer, sliding the neighbours, edge scrolling — writes to
 * the DOM directly: a column slides by setting `translate` on its own cells,
 * and only when its offset changes, so a move restyles the one or two columns
 * in play, never the whole grid. A 100-column grid drags as smoothly as a
 * 5-column one.
 *
 * Near an edge the grid scrolls on its own, every frame, even with the pointer
 * held still: the closer to (or past) the edge, the faster, and the longer it
 * is held, the faster still. A short hover nudges; a long hold crosses the
 * whole table in a couple of seconds.
 */
export function useColumnDrag({
  dir,
  frameRef,
  scrollerRef,
  headerScrollRef,
  placeholderRef,
  getColumns,
  onDrop,
}: {
  dir: 'ltr' | 'rtl'
  frameRef: RefObject<HTMLElement | null>
  scrollerRef: RefObject<HTMLElement | null>
  /** Virtualized grids keep the header in its own strip, which must follow the scroll in the same frame. */
  headerScrollRef: RefObject<HTMLElement | null>
  /** The outline of where the column will land; positioned and sized here. */
  placeholderRef: RefObject<HTMLElement | null>
  /**
   * The visible columns in display order, with their widths. Slots come from
   * this model, not from rendered headers: with column virtualization most
   * headers aren't in the DOM.
   */
  getColumns: () => Array<{ id: string; size: number; fixed: boolean }>
  onDrop: (columnId: string, beforeId: string | null) => void
}) {
  const [drag, setDrag] = useState<ColumnDrag | null>(null)
  const onDropRef = useRef(onDrop)
  useLayoutEffect(() => {
    onDropRef.current = onDrop
  })

  // Ends a drag left running when the grid unmounts.
  const cancelRef = useRef<(() => void) | null>(null)
  useEffect(() => () => cancelRef.current?.(), [])

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLElement>, columnId: string) => {
      if (event.button !== 0 || event.pointerType === 'touch') return
      const header = event.currentTarget
      const target = event.target as Element
      // React bubbles events out of portals (a filter or menu popup), so a press
      // inside one reaches this header without being in its DOM. Ignore those too.
      if (!header.contains(target) || target.closest('[data-no-drag]')) return

      const row = header.parentElement
      const scroller = scrollerRef.current
      const frame = frameRef.current
      if (!row || !frame) return

      const sign = dir === 'rtl' ? -1 : 1
      const startX = event.clientX * sign
      const startScroll = scroller ? inlineScroll(scroller, dir) : 0
      // Slots in scroll-content coordinates, so scrolling mid-drag keeps them valid.
      const origin = 0
      let offset = 0
      const slots: Slot[] = getColumns().map((column) => {
        const slot = { id: column.id, left: origin + offset, right: origin + offset + column.size, fixed: column.fixed }
        offset += column.size
        return slot
      })
      const from = slots.findIndex((slot) => slot.id === columnId)
      const width = slots[from]!.right - slots[from]!.left
      // Columns that stay put (meta.reorderable: false) are walls: the dragged
      // column travels only between the nearest ones on either side.
      const wallLeft = slots
        .slice(0, from)
        .reverse()
        .find((slot) => slot.fixed)
      const wallRight = slots.slice(from + 1).find((slot) => slot.fixed)
      const minOffset = (wallLeft?.right ?? slots[0]!.left) - slots[from]!.left
      const maxOffset = (wallRight?.left ?? slots[slots.length - 1]!.right) - slots[from]!.right

      let active = false
      let pointerX = startX
      let beforeId: string | null | undefined
      let frameId = 0
      let lastTime = 0
      let holdSince = 0
      let holdDirection = 0
      let settleFrame = 0
      let settleTimer = 0
      /** Where the dragged column lands, as an offset from its own slot. */
      let landing = 0
      let placedAt = Number.NaN
      /** Each other column's share of the way to its swapped place, 0–1. */
      const progress = new Map<string, number>()
      const shifts = new Map<string, number>()
      const touched = new Set<HTMLElement>()

      /** Sets `translate` on every rendered cell of a column (the dragged header moves by `transform` instead). */
      const applyShift = (id: string, px: number) => {
        for (const cell of frame.querySelectorAll<HTMLElement>(`[data-col="${cssAttributeValue(id)}"]`)) {
          if (cell === header) continue
          cell.style.translate = px ? `${px}px` : ''
          touched.add(cell)
        }
      }

      /** Slides one column by `px`; only writes when the value changes. */
      const shift = (id: string, px: number) => {
        if ((shifts.get(id) ?? 0) === px) return
        shifts.set(id, px)
        applyShift(id, px)
      }

      const scrollTo = (left: number) => {
        if (!scroller) return
        setInlineScroll(scroller, left, dir)
        // Read back: the browser clamps to the scrollable range.
        mirrorHeader(headerScrollRef.current, scroller)
      }

      /**
       * Places the dragged column at the pointer and every other column at its
       * share of the swap: a column the dragged one covers by a fraction `p` of
       * its width has slid `p` of the dragged width the other way. Past half,
       * it is where the column drops.
       */
      const render = () => {
        const scroll = scroller ? inlineScroll(scroller, dir) : 0
        const offset = Math.min(Math.max(pointerX - startX + (scroll - startScroll), minOffset), maxOffset)
        header.style.transform = `translateX(${offset * sign}px)`
        shift(columnId, Math.round(offset) * sign)

        const left = slots[from]!.left + offset
        const right = left + width
        let target: number | null = null
        slots.forEach((slot, index) => {
          if (index === from) return
          const span = slot.right - slot.left
          const covered = index < from ? slot.right - left : right - slot.left
          const p = slot.fixed || span <= 0 ? 0 : Math.min(Math.max(covered / span, 0), 1)
          progress.set(slot.id, p)
          shift(slot.id, Math.round((index < from ? width : -width) * p) * sign)
          // Leftwards the farthest column passed by half wins; rightwards, too.
          if (p >= 0.5 && (target === null || (index < from ? index < target : index > target))) target = index
        })
        beforeId =
          target === null ? undefined : target < from ? slots[target]!.id : (slots[target + 1]?.id ?? null)
        landing =
          target === null
            ? 0
            : target < from
              ? slots[target]!.left - slots[from]!.left
              : slots[target]!.right - slots[from]!.right

        const placeholder = placeholderRef.current
        if (!placeholder) return
        // Slide to a new slot; follow scrolling (edge scroll) without easing.
        placeholder.style.transition = landing !== placedAt && !Number.isNaN(placedAt) ? `inset-inline-start ${SETTLE_MS}ms ${EASE_OUT}` : 'none'
        placedAt = landing
        placeholder.style.display = ''
        placeholder.style.width = `${width}px`
        placeholder.style.insetInlineStart = `${slots[from]!.left + landing - scroll}px`
      }

      /** One frame of edge scrolling; keeps itself going while the pointer stays in a band. */
      const tick = (time: number) => {
        frameId = 0
        if (!scroller) return
        const box = scroller.getBoundingClientRect()
        const bounds = { left: dir === 'rtl' ? -box.right : box.left, right: dir === 'rtl' ? -box.left : box.right, width: box.width }
        const band = Math.min(EDGE, bounds.width * 0.15)
        let direction = 0
        let depth = 0
        if (pointerX < bounds.left + band) {
          direction = -1
          depth = (bounds.left + band - pointerX) / band
        } else if (pointerX > bounds.right - band) {
          direction = 1
          depth = (pointerX - (bounds.right - band)) / band
        }
        if (direction === 0) {
          holdDirection = 0
          render()
          return
        }

        if (direction !== holdDirection) {
          holdDirection = direction
          holdSince = time
          lastTime = time
        }
        // Clamp the step: a backgrounded tab resumes with one long frame.
        const seconds = Math.min(time - lastTime, 50) / 1000
        lastTime = time

        const proximity = Math.min(depth, 1) ** 2
        const boost = 1 + (MAX_BOOST - 1) * Math.min((time - holdSince) / BOOST_MS, 1)
        const speed = (MIN_SPEED + (MAX_SPEED - MIN_SPEED) * proximity) * boost
        scrollTo(inlineScroll(scroller, dir) + direction * speed * seconds)
        render()
        frameId = requestAnimationFrame(tick)
      }

      const move = (moveEvent: PointerEvent) => {
        pointerX = moveEvent.clientX * sign
        if (!active) {
          if (Math.abs(pointerX - startX) < THRESHOLD) return
          active = true
          // The columns follow the pointer exactly: no easing while it moves.
          frame.setAttribute('data-settling', '')
          document.body.style.cursor = 'grabbing'
          document.body.style.userSelect = 'none'
          setDrag({ columnId })
          // A drag renders every column (virtualized ones included): once they
          // are in the DOM, give the newcomers the slide their column already has.
          settleFrame = requestAnimationFrame(() => {
            settleFrame = 0
            if (!active) return
            for (const [id, px] of shifts) if (px) applyShift(id, px)
          })
        }
        if (!frameId) frameId = requestAnimationFrame(tick)
      }

      /** Commits the drop (or not) and puts every cell back, in one task. */
      const end = (drop: boolean) => {
        settleTimer = 0
        // Render the new order now, synchronously: if React rendered it in a later
        // task, the browser could paint a frame in between with the slides cleared
        // and the old order still up — every column flashing back home.
        flushSync(() => {
          setDrag(null)
          if (drop && beforeId !== undefined) onDropRef.current(columnId, beforeId)
        })
        // Already in their new places: clear the slides without easing, or the
        // columns would replay the move.
        frame.setAttribute('data-settling', '')
        for (const cell of touched) cell.style.translate = ''
        header.style.transition = ''
        header.style.transform = ''
        requestAnimationFrame(() => requestAnimationFrame(() => frame.removeAttribute('data-settling')))
      }

      const finish = (commit: boolean) => {
        cancelRef.current = () => {
          if (settleTimer) clearTimeout(settleTimer)
        }
        scroller?.removeEventListener('scroll', onScroll)
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onCancel)
        window.removeEventListener('keydown', onKey)
        if (frameId) cancelAnimationFrame(frameId)
        if (settleFrame) cancelAnimationFrame(settleFrame)
        if (!active) {
          header.style.transform = ''
          return
        }
        active = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        // The release also produces a click on the header; it must not sort.
        const swallow = (clickEvent: MouseEvent) => {
          clickEvent.stopPropagation()
          clickEvent.preventDefault()
        }
        window.addEventListener('click', swallow, { capture: true, once: true })
        setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0)

        if (!commit) beforeId = undefined
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return end(true)

        // Glide the rest of the way: each column to its side of the drop, the
        // dragged one into its slot (or all back home on a cancel or a short drag).
        frame.removeAttribute('data-settling')
        if (beforeId === undefined) landing = 0
        slots.forEach((slot, index) => {
          if (index === from) return
          const moves = beforeId !== undefined && (progress.get(slot.id) ?? 0) >= 0.5
          shift(slot.id, moves ? (index < from ? width : -width) * sign : 0)
        })
        // The cells' own easing (Tailwind's ease-out), so header and cells glide as one.
        header.style.transition = `transform ${SETTLE_MS}ms ${EASE_OUT}`
        header.style.transform = `translateX(${landing * sign}px)`
        shift(columnId, landing * sign)
        settleTimer = window.setTimeout(() => end(true), SETTLE_MS)
      }
      // Scrolling (a wheel mid-drag) renders new virtualized rows, which lack the
      // slide their column has: give it to them.
      const onScroll = () => {
        if (!active) return
        render()
        for (const [id, px] of shifts) if (px) applyShift(id, px)
      }
      const onUp = () => { if (active) render(); finish(true) }
      const onCancel = () => finish(false)
      const onKey = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === 'Escape') finish(false)
      }

      cancelRef.current = onCancel
      scroller?.addEventListener('scroll', onScroll)
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onCancel)
      window.addEventListener('keydown', onKey)
    },
    [frameRef, scrollerRef, headerScrollRef, placeholderRef, getColumns, dir],
  )

  return { drag, startDrag }
}
