import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { splitVendorChunkPlugin } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['flowbite-react'],
          'vendor-i18n': ['react-i18next', 'i18next', 'i18next-browser-languagedetector'],
          // Feature-based chunks
          'cv-builder': ['./src/pages/Upload.tsx'],
          'dashboard': ['./src/pages/Dashboard.tsx'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/__tests__/setup.ts",
    // Esclude i test Playwright E2E (frontend/e2e/*.spec.ts): usano un test runner
    // diverso e Vitest li raccoglieva per errore facendoli fallire in "npm test".
    exclude: ["node_modules/**", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      exclude: ["node_modules/", "src/__tests__/", "e2e/"],
    },
  },
});
