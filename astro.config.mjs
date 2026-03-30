// @ts-check
import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  build: {
    inlineStylesheets: 'always',
  },
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tiktok-autopost.lovable.app',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  integrations: [
    partytown({
      config: {
        forward: ['fbq', 'ttq'],
      },
    }),
  ],
});
