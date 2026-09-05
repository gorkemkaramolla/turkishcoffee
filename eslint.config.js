import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist/', 'storybook-static/', 'node_modules/'] },
  ...tseslint.configs.recommended,
  reactHooks.configs['recommended-latest'],
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Components spread rest props onto DOM elements; empty object types are
      // legitimate in prop unions.
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
)
