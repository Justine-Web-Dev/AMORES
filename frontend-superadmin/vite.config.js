import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-router': path.resolve(__dirname, 'node_modules/react-router'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
      'react-icons': path.resolve(__dirname, 'node_modules/react-icons'),
      'recharts': path.resolve(__dirname, 'node_modules/recharts'),
      'axios': path.resolve(__dirname, 'node_modules/axios'),
      'react-easy-crop': path.resolve(__dirname, 'node_modules/react-easy-crop'),
      'xlsx': path.resolve(__dirname, 'node_modules/xlsx'),
    }
  }
})
