/**
 * The languages every built-in word ships in. English is the default; a locale
 * in no other language falls back to it.
 */
export const LANGUAGES = ['en', 'tr'] as const
export type Language = (typeof LANGUAGES)[number]

/** The locale a component uses when nothing names one. */
export const DEFAULT_LOCALE = 'en-US'

/** A locale's language among `LANGUAGES`: `tr-TR` and `tr` are `tr`; `de-DE` falls back to `en`. */
export function languageOf(locale: string | undefined): Language {
  const language = locale?.toLowerCase().split(/[-_]/)[0]
  return (LANGUAGES as readonly string[]).includes(language ?? '') ? (language as Language) : 'en'
}

/** One phrase in every language. Plain data, so a server component can hand it to `LocaleText`. */
export type Message = Record<Language, string>

/** One value per language, e.g. a component's whole label set. */
export function inLanguage<T>(values: Record<Language, T>, locale: string | undefined): T {
  return values[languageOf(locale)]
}
