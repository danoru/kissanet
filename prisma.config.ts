import "dotenv/config";
import { defineConfig } from "prisma/config";

// The datasource URL/directUrl are read from env() in prisma/schema.prisma.
// We deliberately don't re-declare them here so that `prisma generate` works
// before a database has been configured (no connection is made at generate time).
// NOTE: do not set `engine: "classic"` — that mode makes the schema engine read
// the connection string from a `datasource` field in THIS config instead of from
// the schema's env(), and without one migrate fails with
// "Cannot destructure property 'url' of 'g' as it is undefined".
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
});
