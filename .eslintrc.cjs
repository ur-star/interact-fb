// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  globals: {
    FB: "readonly",
    fbAsyncInit: "readonly",
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: 'module',
  },
  rules: {
    // Enforce browser best practices
    'no-alert': 'warn',
    'no-console': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-undef': 'error',
    'no-unused-vars': ['warn', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
    'no-restricted-globals': ['error', 'event', 'fdescribe'],
    'no-script-url': 'error',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'warn',
    'no-new-func': 'error',
    // Add more browser-specific rules as needed
  },
};

