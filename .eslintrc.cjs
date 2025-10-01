module.exports = {
  root: true,
  env: { 
    node: true, 
    es2020: true,
    jest: true 
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules',
    'coverage',
    '*.log',
    '*.pid',
    '.eslintrc.cjs'
  ],
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
}
