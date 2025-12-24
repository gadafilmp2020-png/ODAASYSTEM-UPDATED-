
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Critical for cPanel: ensures assets load from relative paths (./assets/...)
      // This allows the app to run in a subdirectory or root public_html
      base: './', 
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.NODE_ENV': JSON.stringify(mode) 
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'), // Corrected: Points to current folder (odaa-main)
        }
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                // Optimize chunking for shared hosting performance
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('recharts') || id.includes('lucide-react')) {
                            return 'vendor-ui';
                        }
                        if (id.includes('@google/genai')) {
                            return 'vendor-ai';
                        }
                        return 'vendor';
                    }
                }
            },
        },
      }
    };
});
