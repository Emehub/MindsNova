/** Migrates the database and loads starting content into empty tables. Safe to run repeatedly. */
import "dotenv/config";
import { closeDb } from "../src/lib/db";
import { bootstrap } from "../src/lib/db/bootstrap";

bootstrap()
  .then(() => console.info("Database ready."))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(closeDb);
