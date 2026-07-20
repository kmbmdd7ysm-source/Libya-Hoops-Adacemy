import js from '@eslint/js';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'reports/**',
      'coverage/**',
      'public/sw.js',
      'scripts/generated/**',
    ],
  },
  {
    files: ['src/**/*.{js,jsx}', 'tests/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // Deprecated in jsx-a11y; label-has-associated-control remains enabled.
      'jsx-a11y/label-has-for': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      // Native controls are checked by label-has-associated-control and accessible-name tests.
      'jsx-a11y/control-has-associated-label': 'off',
      // Intentional backdrop/media pointer surfaces are paired with Escape handling in their dialogs.
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-undef': 'error',
    },
  },
];
