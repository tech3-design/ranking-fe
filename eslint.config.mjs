import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Next.js 16 ships React-Compiler-style rules on by default. They flag
      // legitimate patterns (self-referential useCallback polling helpers,
      // setState inside useEffect, etc.) and add a lot of noise on legacy
      // code. Turn them off in favor of practical, ship-it linting.
      "react-hooks/immutability": "off",
      "react-hooks/react-compiler": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      // Smart-quote / apostrophe escaping is noise on user-facing copy.
      "react/no-unescaped-entities": "off",
      // `any` is heavily used in legacy code; downgrade to a warning so
      // CI/pre-commit don't block on it. Fix gradually as files are touched.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
