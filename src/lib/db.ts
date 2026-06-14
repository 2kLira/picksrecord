import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local");
}

/**
 * Tagged-template SQL client backed by Neon's HTTP driver.
 * Usage: const rows = await sql<Row>`select * from users where id = ${id}`;
 */
export const sql = neon(connectionString);
