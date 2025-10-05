import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

const appName = "css-validator";
const shortName = "css-validator";
const description = "A lightweight, interactive CSS validator built with Svelte 5 runes";
const themeColor = "#007bff";
const backgroundColor = "#ffffff";
const lang = "en";
const basePath = "/css-validator-pages/";

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: appName,
        short_name: shortName,
        description,
        start_url: basePath,
        display: "standalone",
        background_color: backgroundColor,
        theme_color: themeColor,
        lang,
        scope: basePath,
        icons: [
          {
            src: `${basePath}assets/icon-192.png`,
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: `${basePath}assets/icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      },
    }),
  ],
  base: basePath,
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      },
    },
  },
  resolve: {
    alias: {
      $lib: "/src/lib",
      $utils: "/src/utils",
    },
    conditions: ["browser"],
  },
});