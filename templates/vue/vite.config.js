import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    strictPort: true,
    open: true,
  },
  base: '/dist/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'build.js',
      }
    }
  },
  preview: {
    port: 8080,
    strictPort: true,
    open: false,
  }
})
