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
    optimizeDeps: {
      include: [
        "@tauri-apps/api/app",
        "@tauri-apps/api/core",
        "@tauri-apps/plugin-http",
        "@tauri-apps/plugin-stronghold",
        "@tauri-apps/api/window",
        "@tauri-apps/api/path",
        "@tauri-apps/plugin-log",
        "idb-keyval",
        "ms",
        "safe-stable-stringify",
        "serialize-error",
        "@tauri-apps/plugin-os",
        "@tauri-apps/plugin-opener",
        "@vueuse/integrations/useFuse",
        "core-js/proposals/await-dictionary",
        "class-variance-authority",
        "@opfelmusig/lib",
        "@opfelmusig/lib/helpers",
        "@pinia/colada-plugin-auto-refetch",
        "@pinia/colada-plugin-cache-persister",
        "cn",
        "dexie",
        "hls.js",
        "vue-collapsed",
        "motion-v",
        "node-vibrant/browser",
        "@opfelmusig/lib/types",
        "@tauri-apps/plugin-process",
        "@tauri-apps/plugin-updater",
        "@tauri-apps/plugin-deep-link",
        "remeda",
        "@tauri-apps/plugin-clipboard-manager",
        "@tauri-apps/api/webviewWindow",
        "birpc",
      ],
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
