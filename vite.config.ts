import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const appVersion = fs.readFileSync(path.resolve(__dirname, 'VERSION'), 'utf-8').trim();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBaseUrl = (env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

  return {
    plugins: [react()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
        '/health': {
          target: apiBaseUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
