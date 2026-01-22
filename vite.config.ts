import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'ES2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          'charting': ['recharts'],
          'forms': ['react-hook-form', 'react-day-picker'],
          'animation': ['motion'],
          'export': ['jspdf', 'jspdf-autotable'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true,
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    open: false,
    cors: true,
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-dialog',
      'recharts',
      'motion',
    ],
  },
});
