import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
})
/*
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'jsvectormap': '/node_modules/jsvectormap'
    }
  },
  css: {
    preprocessorOptions: {
      css: {
        additionalData: '@import "jsvectormap/dist/css/jsvectormap.css";',
      },
    },
  },
})
*/