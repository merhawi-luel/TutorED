import dotenv from "dotenv";
dotenv.config({ override: true });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined in .env file");
  process.exit(1);
}

console.log("🔌 Connecting to database...");

// Disable SSL for local development, use SSL for production
const client = postgres(connectionString, {
  ssl: connectionString.includes("supabase") ? { rejectUnauthorized: false } : false,
  onnotice: () => {}, // Suppress notices
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
});

// Test the connection
client`SELECT 1`
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    console.error("   Check your DATABASE_URL in .env file");
  });

export const db = drizzle(client, { schema });
export { schema };
