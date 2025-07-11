import js from "@eslint/js";
import ts from "typescript-eslint"; // Du har redan detta package
import reactPlugin from "eslint-plugin-react";
// Uncomment när du installerat react-hooks:
// import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  // Base configurations
  js.configs.recommended,
  ...ts.configs.recommended,
  
  // Configuration for all TypeScript and React files
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "node_modules/**",
      ".next/**", 
      "out/**",
      "dist/**",
      "build/**"
    ],
    
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        JSX: "readonly"
      }
    },
    
    plugins: {
      "@typescript-eslint": ts.plugin,
      "react": reactPlugin
      // Uncomment när du installerat react-hooks:
      // "react-hooks": reactHooksPlugin
    },
    
    rules: {
      // ===== SYNTAX & CRITICAL ERRORS (KEEP THESE) =====
      "no-undef": "error",           // Undefined variables
      "no-unreachable": "error",     // Unreachable code
      "no-dupe-keys": "error",       // Duplicate object keys
      "no-empty": "error",           // Empty blocks
      
      // ===== TYPESCRIPT RULES (RELAXED) =====
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off", 
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "@typescript-eslint/prefer-as-const": "warn",
      
      // ===== REACT RULES (MINIMAL) =====
      "react/react-in-jsx-scope": "off",     // Not needed with Next.js
      "react/prop-types": "off",             // TypeScript handles this
      "react/display-name": "off",           // Not critical
      "react/no-unescaped-entities": "warn", // Warning instead of error
      
      // ===== REACT HOOKS (BASIC) =====
      // Installera react-hooks plugin senare om du vill ha dessa regler
      // "react-hooks/rules-of-hooks": "error",
      // "react-hooks/exhaustive-deps": "warn",
      
      // ===== GENERAL RULES (RELAXED) =====
      "prefer-const": "warn",
      "no-console": "off",          // Allow console.log
      "no-debugger": "warn",        // Warning for debugger statements
      "no-unused-expressions": "off" // Too strict for React development
    },
    
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  
  // Specific overrides for config files
  {
    files: ["*.config.{js,mjs,ts}", "tailwind.config.js", "next.config.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "no-undef": "off"
    }
  }
];