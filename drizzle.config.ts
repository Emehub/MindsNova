import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations are generated from src/lib/db/schema.ts and work for both
// local PGlite and production PostgreSQL.
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});
