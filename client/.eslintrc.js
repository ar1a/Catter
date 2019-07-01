module.exports = {
  extends: [
    'react-app',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  plugins: ['@typescript-eslint', 'unicorn', 'import'],
  rules: {
    'arrow-body-style': ['warn', 'as-needed'],
    'unicorn/prevent-abbreviations': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // if someone is using any, chances are the typechecker is fucking them
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': ['error', { 'newlines-between': 'always' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-destructuring': 'error'
  }
};
