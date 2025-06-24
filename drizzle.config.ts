import type { Config } from 'drizzle-kit';

export default {
  schema: './domain/**/model/*.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/visionix_ems',
  },
} satisfies Config; 