import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use DIRECT_URL (no pgbouncer) for schema operations like db push / migrate
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
})
