import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    return null;
  }
  const databaseUrl = rawUrl.trim().replace(/^["']|["']$/g, "");

  if (!dbInstance) {
    try {
      const sql = neon(databaseUrl);
      dbInstance = drizzle(sql, { schema });
    } catch (err) {
      console.error("Failed to initialize Neon database client:", err);
      return null;
    }
  }

  return dbInstance;
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  return Boolean(url && url.startsWith("postgres"));
}

export { schema };
