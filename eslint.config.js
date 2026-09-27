// ESLint + eslint-plugin-sonarjs: aplica localmente las mismas reglas
// que SonarQube usa para JavaScript (code smells, bugs, complejidad).
const js = require('@eslint/js');
const sonarjs = require('eslint-plugin-sonarjs');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'reports/**', 'coverage/**'] },
  js.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'commonjs', globals: { ...globals.node } },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 15],
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.browser } },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.jest } },
    // En pruebas las contraseñas son datos ficticios y los tokens "inseguros"
    // se crean a propósito para simular ataques. SonarQube trata igual el código de prueba.
    rules: {
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/hardcoded-secret-signatures': 'off',
      'sonarjs/insecure-jwt-token': 'off',
    },
  },
];
