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
    alias: [
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: 'react-router-dom', replacement: path.resolve(__dirname, 'node_modules/react-router-dom') },
      { find: /^react-router$/, replacement: path.resolve(__dirname, 'node_modules/react-router') },
      { find: 'react-icons', replacement: path.resolve(__dirname, 'node_modules/react-icons') },
      { find: 'recharts', replacement: path.resolve(__dirname, 'node_modules/recharts') },
      { find: 'axios', replacement: path.resolve(__dirname, 'node_modules/axios') },
      { find: 'react-easy-crop', replacement: path.resolve(__dirname, 'node_modules/react-easy-crop') },
      { find: 'xlsx', replacement: path.resolve(__dirname, 'node_modules/xlsx') },
    ]
  }
})
