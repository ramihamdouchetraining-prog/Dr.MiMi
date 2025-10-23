import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: '/', // Important for Vercel SPA routing
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: ['.replit.dev', '.replit.app', '.repl.co', 'localhost'],
    hmr: {
      // Configuration HMR adaptée pour GitHub Codespaces / environnement local
      overlay: true, // Afficher les erreurs en overlay au lieu de recharger
      protocol: 'ws', // Utiliser WS au lieu de WSS pour environnement local
      host: 'localhost',
      port: 5000
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/attached_assets'
    }
  }
})