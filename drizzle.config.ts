import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

// drizzle-kit 需要一个完整的 url
const dbUrl = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`;

export default defineConfig({
  out: './drizzle',
  schema: './server/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: dbUrl,
  },
});
