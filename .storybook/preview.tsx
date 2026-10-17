import { useEffect, type ReactNode } from 'react'
import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/styles/storybook.css'
import { LocaleProvider } from '../src/components/locale-provider'

/**
 * The `dark` class goes on <html>, not on a wrapper div — otherwise html/body
 * keep their light background and show through below the story content.
 */
function ThemeCanvas({
  isDark,
  inDocs,
  fullBleed,
  children,
}: {
  isDark: boolean
  inDocs: boolean
  fullBleed: boolean
  children: ReactNode
}) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // A whole screen (parameters.fullBleed) fills the canvas edge to edge.
  if (fullBleed) return <div className="bg-background text-foreground">{children}</div>

  return (
    // On a Docs page every story renders inline, so a full-height canvas would
    // push each code block a screen apart.
    <div
      className={`bg-background text-foreground flex items-center justify-center p-10 ${inDocs ? '' : 'min-h-dvh'}`}
    >
      {children}
    </div>
  )
}

const withTheme: Decorator = (Story, context) => (
  <ThemeCanvas
    isDark={context.globals.theme === 'dark'}
    inDocs={context.viewMode === 'docs'}
    fullBleed={context.parameters.fullBleed === true}
  >
    <Story />
  </ThemeCanvas>
)

/**
 * Every story in the toolbar's language. `<html lang>` follows too, as it would
 * on a real page, so components read it the same way with or without a provider.
 */
function LocaleCanvas({ locale, children }: { locale: string; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>
}

const withLocale: Decorator = (Story, context) => (
  <LocaleCanvas locale={context.globals.locale as string}>
    <Story />
  </LocaleCanvas>
)

const preview: Preview = {
  decorators: [withLocale, withTheme],
  // A Docs page per component: its JSDoc, a props table and every story with its code.
  tags: ['autodocs'],
  initialGlobals: {
    theme: 'light',
    locale: 'en-US',
  },
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Language of the words components render themselves',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: [
          { value: 'en-US', title: 'English' },
          { value: 'tr-TR', title: 'Türkçe' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    // axe runs on every story and reports in the a11y panel; stories whose
    // components are already clean fail on violations with `test: 'error'`.
    a11y: { test: 'todo' },
    // Storybook's own backgrounds addon would paint over the token background.
    backgrounds: { disable: true },
    docs: {
      // A "Code" tab under each story, and code open by default on Docs pages.
      codePanel: true,
      canvas: { sourceState: 'shown' },
    },
  },
}

export default preview
