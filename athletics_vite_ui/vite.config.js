import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@config': '/src/config',
      '@assets': '/src/assets',
      '@core': '/src/core',
      '@modules': '/src/modules',
      '@shared': '/src/shared',
    },
  },
})
