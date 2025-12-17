// apps/backend/eslint.config.js
const js = require("@eslint/js");
const importPlugin = require("eslint-plugin-import");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "**/*.d.ts",
      "src/migrations/**",
      "eslint.config.js",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "no-console": "off",
      "no-debugger": "warn",

      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],

      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          "alphabetize": { order: "asc", caseInsensitive: true },
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
