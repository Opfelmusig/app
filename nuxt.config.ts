// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxt/ui"],

  // UI

  css: ["~/assets/css/tailwind.css"],

  colorMode: {
    preference: "dark",
    fallback: "dark",
  },

  fonts: {
    provider: "bunny",
    families: [
      {
        name: "Inter",
        provider: "bunny",
        weights: [400, 500, 600, 700],
        styles: ["normal"],
        subsets: ["latin"],
      },
    ],
  },

  // Others

  experimental: {
    typescriptPlugin: true,
  },
});
