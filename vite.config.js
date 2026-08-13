import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Backend al que apunta el proxy de desarrollo (solo aplica cuando
  // VITE_SERVER_HOST es una ruta relativa como '/api').
  const proxyTarget = env.VITE_PROXY_TARGET ?? 'http://localhost:3000';
  const serverHost = env.VITE_SERVER_HOST ?? '/api';
  const useProxy = serverHost.startsWith('/');

  return {
    plugins: [eslint(), react()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@components', replacement: path.resolve(__dirname, './src/components') },
        { find: '@pages', replacement: path.resolve(__dirname, './src/pages') },
        { find: '@styles', replacement: path.resolve(__dirname, './src/styles') },
        { find: '@assets', replacement: path.resolve(__dirname, './src/assets') },
        { find: '@hooks', replacement: path.resolve(__dirname, './src/hooks') },
        { find: '@helpers', replacement: path.resolve(__dirname, './src/helpers') },

      ],
    },
    server: {
      proxy: useProxy
        ? {
          [serverHost]: {
            target: proxyTarget,
            changeOrigin: true,
          },
        }
        : undefined,
    },
  };
});
