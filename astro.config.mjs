import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// Pages are built ahead of time; the Node server (port 3000) serves them, ready for
// server routes later (e.g. a contact form or blog comments).
export default defineConfig({
  site: 'https://playflex.net',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
  server: { host: '127.0.0.1', port: 3000 },
});
