import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Use relative base path for compatibility with all hosting platforms
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        // Optimize build output
        sourcemap: false,
        minify: 'esbuild', // Use esbuild for faster builds
        target: 'es2015',
        rollupOptions: {
          output: {
            manualChunks: {
              // Split vendor code for better caching
              'react-vendor': ['react', 'react-dom'],
            },
          },
        },
      },
      esbuild: {
        // Remove console.logs and debugger in production
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
