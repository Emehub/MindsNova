import "dotenv/config";
import { closeDb } from "../src/lib/db";
import { runMigrations } from "../src/lib/db/migrate";

runMigrations()
  .then(() => console.info("Migrations applied."))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
