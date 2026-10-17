import type { Locale } from 'react-day-picker'
import { enUS } from 'react-day-picker/locale/en-US'
import { tr } from 'react-day-picker/locale/tr'
import { inLanguage } from './i18n'

/**
 * The date-fns locale, with react-day-picker's screen-reader labels, for a
 * BCP 47 locale's language: month and day names, the week's first day, date
 * formats and the calendar's navigation names.
 */
export function dayPickerLocale(locale: string): Locale {
  return inLanguage<Locale>({ en: enUS, tr }, locale)
}
