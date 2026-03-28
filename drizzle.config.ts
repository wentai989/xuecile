import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './server/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.MYSQL_URL || process.env.NUXT_MYSQL_URL || '',
  },
});
