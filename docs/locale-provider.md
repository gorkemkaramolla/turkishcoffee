# LocaleProvider

**Client component** (`"use client"`): import it from server components too. It renders to HTML on the server, then hydrates in the browser for its interactivity.

```tsx
import { LocaleProvider, useLocale, LocaleText, type LocaleProviderProps } from 'turkishcoffee'
```

The language and locale of every component below it: the words they render
themselves (labels, screen-reader names, placeholders), and the formatting,
sorting and dates that follow the locale. English and Turkish ship complete;
any other locale gets English words with its own formatting.

Without a provider, components follow the page's `<html lang>` once they
mount. On a server-rendered page that is one render in English first: put
the provider at the root, with the same locale as `<html lang>`, to render
in the right language from the first byte.

A component's own `locale` or `labels` prop still wins over the provider.

## Example

```tsx
<html lang="tr">
  <body>
    <LocaleProvider locale="tr-TR">{children}</LocaleProvider>
  </body>
</html>
```

## Props

Only props this library adds or changes; everything else forwards to the underlying element or Base UI part.

- `locale: string` — A BCP 47 locale, e.g. `tr-TR`. Usually the page's own `<html lang>`.

## Parts

- `type LocaleProviderProps`
- `useLocale` — The locale to render in: `locale` when the component was given one, else the nearest LocaleProvider's, else the page's `<html lang>` (after hydration, so server and client agree on the first render), else `en-US`.
- `LocaleText` — A phrase in the current language. Lets a server component render a translated word without turning client: it passes the plain `Message` and only this leaf reads the locale.
