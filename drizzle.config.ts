import type { Config } from 'drizzle-kit';

export default {
  schema: './src/domain/**/model/*.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/visionix_ems',
  },
} satisfies Config; 