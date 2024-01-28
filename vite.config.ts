import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  resolve: {
    alias: {
      components: '/src-ui/renderer/components',
      database: '/src-ui/database',
      event: '/src-ui/event',
      logger: '/src-ui/logger',
      'renderer/editor': '/src-ui/renderer/editor',
      'renderer/reactive': '/src-ui/renderer/reactive',
      store: '/src-ui/store',
      types: '/src-ui/types',
    },
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
