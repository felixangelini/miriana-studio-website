// @ts-check
import { defineConfig, envField } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),

  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret' }),
      CONTACT_TO: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: 'info@mirianastudio.it',
      }),
      CONTACT_FROM: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: 'Miriana Studio <onboarding@resend.dev>',
      }),
    },
  },
});
