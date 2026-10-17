'use client'

import * as React from 'react'
import { DEFAULT_LOCALE, inLanguage, type Message } from '../../lib/i18n'
import { pageLocale } from '../../lib/locale'

const LocaleContext = React.createContext<string | undefined>(undefined)

export type LocaleProviderProps = {
  /** A BCP 47 locale, e.g. `tr-TR`. Usually the page's own `<html lang>`. */
  locale: string
  children: React.ReactNode
}

/**
 * The language and locale of every component below it: the words they render
 * themselves (labels, screen-reader names, placeholders), and the formatting,
 * sorting and dates that follow the locale. English and Turkish ship complete;
 * any other locale gets English words with its own formatting.
 *
 * Without a provider, components follow the page's `<html lang>` once they
 * mount. On a server-rendered page that is one render in English first: put
 * the provider at the root, with the same locale as `<html lang>`, to render
 * in the right language from the first byte.
 *
 * A component's own `locale` or `labels` prop still wins over the provider.
 *
 * @example
 * <html lang="tr">
 *   <body>
 *     <LocaleProvider locale="tr-TR">{children}</LocaleProvider>
 *   </body>
 * </html>
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

function subscribeToPageLanguage(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
  return () => observer.disconnect()
}

const noPageLocale = () => undefined

/**
 * The locale to render in: `locale` when the component was given one, else
 * the nearest LocaleProvider's, else the page's `<html lang>` (after
 * hydration, so server and client agree on the first render), else `en-US`.
 */
export function useLocale(locale?: string): string {
  const provided = React.useContext(LocaleContext)
  const page = React.useSyncExternalStore(subscribeToPageLanguage, pageLocale, noPageLocale)
  return locale ?? provided ?? page ?? DEFAULT_LOCALE
}

/**
 * A phrase in the current language. Lets a server component render a
 * translated word without turning client: it passes the plain `Message` and
 * only this leaf reads the locale.
 */
export function LocaleText({ message }: { message: Message }) {
  return inLanguage(message, useLocale())
}
