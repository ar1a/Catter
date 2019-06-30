module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:unicorn/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  plugins: ['@typescript-eslint', 'unicorn', 'import'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'arrow-body-style': ['warn', 'as-needed'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // if someone is using any, chances are the typechecker is fucking them
    '@typescript-eslint/no-explicit-any': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      { whitelist: { ctx: true, err: true, args: true } }
    ],
    'import/order': ['error', { 'newlines-between': 'always' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-destructuring': 'error'
  },
  parser: '@typescript-eslint/parser'
};
