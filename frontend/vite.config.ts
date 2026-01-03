import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000/api/v1'
  let apiOrigin = ''
  try {
    apiOrigin = new URL(apiUrl).origin
  } catch (e) {
    // Fallback or ignore invalid URL
    console.warn('Invalid VITE_API_URL, using default origin for preconnect')
    apiOrigin = 'http://localhost:8000'
  }

  return {
    base: '/wordle-decoded/',
    plugins: [
      react(),
      mode === 'analyze' &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(/%VITE_API_ORIGIN%/g, apiOrigin)
        },
      },
    ],
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
    build: {
      // Enable production optimizations with terser (better compression)
      minify: 'terser',
      // Code splitting configuration
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk - React core
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Charts chunk - Lazy loaded
            'charts': ['recharts'],
            // Query chunk
            'query': ['@tanstack/react-query'],
          },
        },
      },
      // Increase chunk size warning limit (we have manual chunks)
      chunkSizeWarningLimit: 1000,
      // Source maps for debugging (disable in production for smaller size)
      sourcemap: false,
    },
    // Production optimizations
    esbuild: {
      // Remove debugger statements and reduce whitespace
      drop: ['debugger'],
      legalComments: 'none',
    },
  }
})
