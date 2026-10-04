/*
 * Active and highlighted states. Instead of a grey fill, an active part gets a
 * faint primary tint (--selection) and, where it marks "you are here", a 2px
 * primary edge. The edge is an inset shadow so it never shifts layout. Each
 * string carries its own state variant because Tailwind needs whole class names.
 */

/** Open accordion header: tint + left edge. */
export const openHeader =
    "data-open:bg-selection data-open:shadow-[inset_2px_0_0_var(--color-primary)] ";

/** Active tab: bottom edge under the raised segment. */
export const activeTab =
    "data-active:bg-background data-active:text-foreground data-active:shadow-[inset_0_-2px_0_var(--color-primary)]";

/** Selected table row (`data-state="selected"`, as TanStack sets it): tint + left edge. */
export const selectedRow =
    "data-[state=selected]:bg-selection data-[state=selected]:shadow-[inset_2px_0_0_var(--color-primary)]";

/** Keyboard/pointer highlight inside menus and listboxes: tint only. */
export const highlightedItem =
    "data-highlighted:bg-selection data-highlighted:text-foreground";
