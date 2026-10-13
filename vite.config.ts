import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  // Relative asset URLs, so the built site can be dropped on any host or sub-folder.
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5180,
    open: false,
  },
  build: {
    // three.js is split into its own chunk by the dynamic imports; it is large by nature.
    chunkSizeWarningLimit: 900,
  },
})
