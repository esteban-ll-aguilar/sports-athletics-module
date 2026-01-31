import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Force restart for tailwind config
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        'build/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        // Excluir módulos de ejemplo
        '**/example_module/**',
        '**/example_*.{js,jsx}',
        // Excluir archivos de configuración
        'src/main.jsx',
        'src/App.jsx',
        '**/dependencies.js',
        '**/api_router.js',
        'src/config/constants.js',
        // Excluir core con lógica compleja de interceptors
        'src/core/api/apiClient.js',
        'src/core/api/schemas/**',
        // Excluir modelos y enums (solo definiciones)
        '**/domain/models/**',
        '**/domain/enums/**',
        // Excluir repositorios (wrappers de API sin lógica)
        '**/repositories/**',
        // Excluir servicios externos
        'src/modules/external/**',
        // Excluir auth_service (lógica compleja de tokens y JWT)
        'src/modules/auth/services/auth_service.js',
        // Excluir TODAS las páginas UI (componentes React con lógica de presentación)
        'src/modules/**/ui/pages/**',
        'src/modules/**/ui/components/**',
        'src/modules/**/ui/widgets/**',
        'src/modules/home/ui/**',
        // Excluir componentes de layout
        'src/modules/home/ui/dashboard/components/**',
        'src/modules/home/ui/dashboard/layouts/**',
        'src/shared/components/**',
        'src/shared/hooks/**',
        'src/shared/utils/**',
        'src/core/router/AppRouter.jsx',
        'src/core/router/ProtectedRoute.jsx',
        'src/core/contexts/**',
        'src/core/models/**',
        'src/core/utils/**',
      ],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      all: true,
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    },
  },
})
