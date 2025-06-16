module.exports = {
  root: true,
  extends: [
    '@eslint/recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '.netlify/'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  env: {
    node: true,
    browser: true,
    es2022: true
  }
}