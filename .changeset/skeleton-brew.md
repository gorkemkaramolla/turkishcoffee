---
"turkishcoffee": minor
---

Skeleton has its own motion in place of Tailwind's `animate-pulse`. A brand-blue glint crosses the page diagonally from the bottom-left corner to the top-right, comes back fainter, then rests. It is pinned to the viewport, so all the skeletons on a page share one light and the page loads as one surface instead of many boxes blinking on their own. Reduced motion keeps a still fill. The colours are tokens: `--skeleton`, `--skeleton-glint` and `--skeleton-glint-return`. A background utility in `className` still overrides the fill.
