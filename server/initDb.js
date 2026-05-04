import fs from "fs";
import { pool } from "./db.js";

async function initDb() {
  try {
    const schema = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

    await pool.query(schema);

    console.log("Database schema created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database init failed:", error);
    process.exit(1);
  }
}

initDb();