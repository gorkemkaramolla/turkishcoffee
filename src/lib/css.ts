/**
 * Escapes a value for a quoted CSS attribute selector, e.g.
 * `[data-col="${cssAttributeValue(id)}"]`, so ids holding `"` or `\` stay
 * one value.
 */
export function cssAttributeValue(value: string): string {
  return value.replace(/["\\]/g, '\\$&')
}
