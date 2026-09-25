export default defineNuxtConfig({
  // Nuxt

  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Modules

  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@waradu/keyboard/nuxt",
    "@pinia/colada-nuxt",
  ],

  keyboard: {
    capture: true,
  },

  piniaPluginPersistedstate: {
    storage: "localStorage",
  },

  pinia: {
    storesDirs: ["stores"],
  },

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

  icon: {
    provider: "server",
    fallbackToApi: false,
    serverBundle: {
      collections: ["lucide"],
    },
    clientBundle: {
      scan: true,
      icons: [],
    },
  },

  // Others

  experimental: {
    typescriptPlugin: true,
  },
});
