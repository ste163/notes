/// <reference types="vitest" />
import { defineConfig } from 'vite'
import markdown, { Mode } from 'vite-plugin-markdown'

// TODO: split the config so that the Tauri-specifics are separate
// from what is used by both Web and Tauri builds
export default defineConfig({
  base: './',
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false, // don't minify debug builds
    sourcemap: !!process.env.TAURI_DEBUG, // TODO: do these for any non-prod build
  },
  clearScreen: false,
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  plugins: [markdown({ mode: [Mode.MARKDOWN] })],
  resolve: {
    alias: {
      config: '/src-ui/config',
      const: '/src-ui/const',
      components: '/src-ui/renderer/components',
      database: '/src-ui/database',
      event: '/src-ui/event',
      icons: '/src-ui/renderer/icons',
      logger: '/src-ui/logger',
      'renderer/reactive': '/src-ui/renderer/reactive',
      'test-utils': '/src-ui/test-utils',
      types: '/src-ui/types',
      'url-controller': '/src-ui/url-controller',
      'use-local-storage': '/src-ui/use-local-storage',
    },
  },
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest-setup.ts'],
  },
})
