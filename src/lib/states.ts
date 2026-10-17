/*
 * Active and highlighted states. They stay neutral (a grey --selection fill),
 * except the active tab, which is a solid primary segment. Each string carries
 * its own state variant because Tailwind needs whole class names.
 */

/** Active tab: the solid primary segment. */
export const activeTab =
    "data-active:bg-primary data-active:text-primary-foreground";

/** Keyboard/pointer highlight inside menus and listboxes. */
export const highlightedItem =
    "data-highlighted:bg-selection data-highlighted:text-foreground";
