import type { Decorator, Preview } from '@storybook/react-vite'
import '../src/styles/storybook.css'

/**
 * Every story renders inside a theme wrapper so components are checked in both
 * light and dark as they are built. Flip it from the toolbar.
 */
const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals.theme === 'dark'
  return (
    <div className={isDark ? 'dark' : undefined}>
      <div className="bg-background text-foreground flex min-h-32 items-center justify-center p-10">
        <Story />
      </div>
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
  },
}

export default preview
