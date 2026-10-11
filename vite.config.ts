import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Numero della build (in CI è il numero dell'esecuzione): l'app lo confronta con quello del sito per proporre l'aggiornamento
    define: {
      __BUILD_NUMBER__: JSON.stringify(Number(process.env.BUILD_NUMBER) || 0),
      __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || 'sviluppo'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
