import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 3000,
    },
    watch: {
      usePolling: true,
    },
    // Allow Docker internal hostnames for Playwright tests
    allowedHosts: [
      'localhost',
      'frontend',
      '127.0.0.1',
      '0.0.0.0',
    ],
  },
})
