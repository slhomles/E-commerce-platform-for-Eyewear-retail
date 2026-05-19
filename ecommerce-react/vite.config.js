import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const backendTarget = process.env.VITE_BACKEND_URL || 'http://52.68.124.230:8081';
const backendProxy = {
  target: backendTarget,
  changeOrigin: true,
  secure: false,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api': backendProxy,
      '/uploads': backendProxy,
      '/oauth2': backendProxy,
      '/login/oauth2': backendProxy
    }
  }
})
