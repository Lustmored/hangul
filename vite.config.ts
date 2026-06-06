import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      base,
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Hangul Rush',
        short_name: 'Hangul Rush',
        description: 'A fast-paced quiz for drilling Hangul letters and syllables.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#09070f',
        theme_color: '#0d0a16',
        icons: [
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              networkTimeoutSeconds: 3
            }
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'worker',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets'
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images'
            }
          }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts'
  }
});
