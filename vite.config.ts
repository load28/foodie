import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
    },
  },

  // 빌드 설정
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'apollo-vendor': ['@apollo/client', 'graphql'],
        },
      },
    },
  },

  // 개발 서버 설정
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/graphql': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // 환경 변수 접두사
  envPrefix: 'VITE_',

  // CSS 설정
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
})
