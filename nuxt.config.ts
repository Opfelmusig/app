// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/eslint", "@nuxt/ui", "@vueuse/nuxt"],

  // Tauri

  ssr: false,

  vite: {
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
    resolve: {
      dedupe: ["vue"],
    },
    server: {
      strictPort: true,
    },
  },

  ignore: ["**/src-tauri/**"],

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
