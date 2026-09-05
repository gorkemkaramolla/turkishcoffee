import { useEffect } from 'react'
import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/styles/storybook.css'

/**
 * The `dark` class goes on <html>, not on a wrapper div — otherwise html/body
 * keep their light background and show through below the story content.
 */
const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals.theme === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <div className="bg-background text-foreground flex min-h-dvh items-center justify-center p-10">
      <Story />
    </div>
  )
}

const preview: Preview = {
  decorators: [withTheme],
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
    // Storybook's own backgrounds addon would paint over the token background.
    backgrounds: { disable: true },
  },
}

export default preview
