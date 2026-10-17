/**
 * The page's language (`<html lang>`), the default locale for sorting,
 * filtering and exports. `undefined` on the server or without a `lang`, which
 * lets `Intl` fall back to the runtime's own.
 */
export function pageLocale(): string | undefined {
  return typeof document === 'undefined' ? undefined : document.documentElement.lang || undefined
}
