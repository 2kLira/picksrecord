import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DATABASE_URL. Run with: node --env-file=.env.local scripts/migrate.mjs");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const schema = readFileSync(join(__dirname, "../src/lib/schema.sql"), "utf8");

// Strip comment lines, then split into individual statements
// (no semicolons appear inside our DDL bodies).
const statements = schema
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Applying ${statements.length} statements…`);
for (const statement of statements) {
  await pool.query(statement);
  const label = statement.replace(/\s+/g, " ").slice(0, 64);
  console.log(`  ✓ ${label}…`);
}
await pool.end();
console.log("Migration complete.");
