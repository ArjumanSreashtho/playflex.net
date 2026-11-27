import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Pages are built ahead of time; the Node server (port 3000) serves them.
export default defineConfig({
  site: 'https://frostspear.playflex.net',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
  redirects: {
    '/frostspear/privacy': '/privacy',
    '/frostspear': '/',
  },
  server: { host: '127.0.0.1', port: 3000 },
});
