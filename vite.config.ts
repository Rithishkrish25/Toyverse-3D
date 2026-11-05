import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@scene': path.resolve(__dirname, 'src/scene'),
      '@toys': path.resolve(__dirname, 'src/toys'),
      '@painting': path.resolve(__dirname, 'src/painting'),
      '@missions': path.resolve(__dirname, 'src/missions'),
      '@animations': path.resolve(__dirname, 'src/animations'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@i18n': path.resolve(__dirname, 'src/i18n'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  build: {
    rollupOptions: {
      external: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: { reporter: ['text', 'json'] },
  },
})
