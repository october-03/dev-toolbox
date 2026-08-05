import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  {
    ignores: ["dist", "out", "node_modules", ".vscode-test"],
  },
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },

    rules: {
      "@typescript-eslint/naming-convention": ["warn", { selector: "import", format: ["camelCase", "PascalCase"] }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
    },
  },
  eslintConfigPrettier,
);
