import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/Deome/' : '/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat'],
  },
}));
