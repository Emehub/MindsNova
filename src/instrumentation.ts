/** Runs once when the Next.js server starts: migrate the database and load starting content. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SKIP_DB_BOOTSTRAP !== "true") {
    const { bootstrap } = await import("./lib/db/bootstrap");
    try {
      await bootstrap();
    } catch (e) {
      console.error("[db] Bootstrap failed:", e);
    }
  }
}
