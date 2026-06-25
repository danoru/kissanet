import "dotenv/config";
import { defineConfig } from "prisma/config";

// The datasource URL is read from env("DATABASE_URL") in prisma/schema.prisma.
// We deliberately don't re-declare it here so that `prisma generate` works
// before a database has been configured (no connection is made at generate time).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
});
