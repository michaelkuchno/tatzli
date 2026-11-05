import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

const target = process.env.TATZLI_TARGET ?? 'web'
// GitHub Pages serves the PWA under /<repo>/; Capacitor and local preview use relative paths.
const base = process.env.TATZLI_BASE ?? (target === 'android' ? './' : '/')

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0') },
  resolve: {
    alias: {
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      disable: target === 'android',
      includeAssets: ['icons/*.png', 'icons/*.svg', 'fonts/*.ttf'],
      manifest: {
        name: 'Tatzli – Bärndütsch für Chind',
        short_name: 'Tatzli',
        description: 'Bärndütsch, Deutsch, Polski & English für Kinder 2–7',
        lang: 'de-CH',
        theme_color: '#f6b04a',
        background_color: '#fff7e8',
        display: 'fullscreen',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        globIgnores: ['audio/**/*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/audio/'),
            handler: 'CacheFirst',
            options: { cacheName: 'tatzli-audio', expiration: { maxEntries: 6000 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.ttf'),
            handler: 'CacheFirst',
            options: { cacheName: 'tatzli-fonts' },
          },
        ],
      },
    }),
  ],
})
