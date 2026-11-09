module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  // Magic Patterns' precompiled vendor bundle is checked through its declarations
  // and runtime browser suite; lint authored source, not minified library output.
  // Pinned external workflow engines have their own upstream lint configuration.
  ignorePatterns: ['dist', '.eslintrc.cjs', 'src/_designSystem/**/library.js', 'src/magic-saas/_designSystem/**/library.js', 'vendor/impeccable/**', 'vendor/super-board/**'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
