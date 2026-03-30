// @ts-check
import { defineConfig } from 'astro/config';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tiktok-autopost.lovable.app',
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
