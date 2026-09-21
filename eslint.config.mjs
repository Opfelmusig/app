// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    ignores: ["src-tauri/**"],
  },
  {
    rules: {
      "vue/block-lang": [
        "error",
        {
          script: {
            lang: "ts",
            allowNoLang: false,
          },
        },
      ],
      "vue/component-api-style": ["error", ["script-setup"]],
      "vue/html-self-closing": "off",
      "vue/no-v-html": "off",
      "vue/return-in-computed-property": "off",
    },
  },
).append({
  name: "custom/imports",
  files: ["app/**/*", "layers/*/app/**/*"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["../*", "../**", "./*", "./**", ".", ".."],
            message: "Use absolute import paths.",
          },
        ],
      },
    ],
  },
});
