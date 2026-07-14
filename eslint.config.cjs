const { defineConfig, globalIgnores } = require("eslint/config")
const nextParser = require("./node_modules/eslint-config-next/dist/parser")
const nextPlugin = require("@next/eslint-plugin-next")
const reactHooks = require("eslint-plugin-react-hooks")

module.exports = defineConfig([
  globalIgnores([
    ".next/**",
    ".next-build/**",
    ".next-codex/**",
    ".next-verify/**",
    ".next-webpack/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    languageOptions: {
      parser: nextParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        allowImportExportEverywhere: true,
        babelOptions: {
          presets: ["next/babel"],
          caller: { supportsTopLevelAwait: true },
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.flat.recommended.rules,
    },
  },
])
