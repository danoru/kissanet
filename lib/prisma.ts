import { PrismaClient } from "@prisma/client";

/** True when a real Postgres connection string is configured. */
export function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && url.startsWith("postgres");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse a single client across hot reloads in dev.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
