import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { 
      js 
    }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": ["warn", { 
        "args": "none", // Игнорировать неиспользуемые аргументы функций
        "varsIgnorePattern": "^_", // Игнорировать переменные, начинающиеся с _
        "argsIgnorePattern": "^_" // Игнорировать аргументы, начинающиеся с _
      }],
      "no-console": "off",
    }
  },
]);