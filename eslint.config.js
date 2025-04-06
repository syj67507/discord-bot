// @ts-check

const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "@typescript-eslint/no-empty-function": "off",
    },
  },
);
