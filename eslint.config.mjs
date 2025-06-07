import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import ts from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";

export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["node_modules/**"],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      // ESLint plugins for TypeScript and React
      "@typescript-eslint": ts.plugin,
      "react": reactPlugin
    },
    extends: [
      // Base ESLint recommended rules + TypeScript and React recommended rules
      js.configs.recommended,
      ts.configs.recommended,
      reactPlugin.configs.recommended
    ],
    rules: {
      // Turn off intrusive TypeScript rules for flexible development
      "@typescript-eslint/no-explicit-any": "off",           // tillåt 'any' utan fel:contentReference[oaicite:7]{index=7}
      "@typescript-eslint/no-unsafe-function-type": "off",   // tillåt användning av typ 'Function':contentReference[oaicite:8]{index=8}
      "@typescript-eslint/no-empty-object-type": "off",      // tillåt användning av tomma objekttypen {}:contentReference[oaicite:9]{index=9}
      "@typescript-eslint/ban-types": "off",                 // (säkerhetsåtgärd) tillåt 'Function' och '{}' om äldre config använder ban-types

      "@typescript-eslint/no-var-requires": "off",           // tillåt require() i TypeScript:contentReference[oaicite:10]{index=10}
      "@typescript-eslint/explicit-module-boundary-types": "off", // kräv inte explicita retur/parameter-typer

      // Turn off React rules that are unnecessary or intrusive with modern TS/React
      "react/react-in-jsx-scope": "off",   // React import ej nödvändigt för JSX:contentReference[oaicite:11]{index=11}
      "react/prop-types": "off",          // inte relevant med TypeScript-typer:contentReference[oaicite:12]{index=12}

      // Disable base rules that TypeScript handles better or conflict with TS
      "no-undef": "off"                   // TypeScript sköter undefined-varningar:contentReference[oaicite:13]{index=13}
    },
    settings: {
      // Automatiskt upptäcka React-version (för eslint-plugin-react)
      react: {
        version: "detect"
      }
    }
  }
]);
