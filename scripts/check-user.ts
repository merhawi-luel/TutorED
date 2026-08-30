import { db } from "../server/db";
import { users } from "../server/db/schema";
import { eq } from "drizzle-orm";

const userId = "59d0624d-8e1e-44ff-9b79-cf485b9cc56f";

async function checkUser() {
  console.log(`🔍 Checking if user exists: ${userId}`);
  
  const found = await db.select().from(users).where(eq(users.id, userId));
  
  if (found.length > 0) {
    console.log("✅ User found in database:");
    console.log(JSON.stringify(found[0], null, 2));
  } else {
    console.log("❌ User NOT found in database");
    console.log("\nThis means the OAuth callback route didn't create the user in PostgreSQL.");
    console.log("The user exists in Supabase Auth but not in our database.");
  }
  
  process.exit(0);
}

checkUser().catch(console.error);
