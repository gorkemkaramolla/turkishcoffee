import { useEffect, type ReactNode } from 'react'
import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/styles/storybook.css'

/**
 * The `dark` class goes on <html>, not on a wrapper div — otherwise html/body
 * keep their light background and show through below the story content.
 */
function ThemeCanvas({
  isDark,
  inDocs,
  children,
}: {
  isDark: boolean
  inDocs: boolean
  children: ReactNode
}) {
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

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
  <ThemeCanvas isDark={context.globals.theme === 'dark'} inDocs={context.viewMode === 'docs'}>
    <Story />
  </ThemeCanvas>
)

const preview: Preview = {
  decorators: [withTheme],
  // A Docs page per component: its JSDoc, a props table and every story with its code.
  tags: ['autodocs'],
  initialGlobals: {
    theme: 'light',
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
