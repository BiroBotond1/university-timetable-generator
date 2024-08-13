module.exports = {
  root: true,
  env: {
    node: true,
    browser: true, // Ensures browser globals like 'window' and 'document' are recognized
    es2021: true // Allows for the parsing of modern ECMAScript features
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 12, // Allows parsing of modern ECMAScript features
    sourceType: 'module', // Allows the use of imports
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-unused-components': 'warn', // Warns when there are unused components
    'vue/no-unused-vars': 'warn', // Warns when there are unused variables in Vue templates
    'vue/require-prop-types': 'error', // Enforces prop type definitions
    'vue/require-default-prop': 'error', // Enforces default prop values
    'eqeqeq': 'error', // Enforces the use of === and !==
    'curly': 'error', // Enforces consistent brace style for all control statements
    'no-implicit-globals': 'error', // Disallow variable and function declarations in the global scope
    'strict': ['error', 'global'] // Enforces strict mode
  }
}
