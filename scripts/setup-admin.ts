import dotenv from "dotenv";
dotenv.config({ override: true });
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";
import { eq } from "drizzle-orm";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DATABASE_URL = process.env.DATABASE_URL!;

const ADMIN_EMAIL = process.argv[2] || "merhawiluel26@gmail.com";
const ADMIN_PASSWORD = process.argv[3] || "Mera2004";
const ADMIN_NAME = process.argv[4] || "Admin";

async function setupAdmin() {
  console.log("🔧 Setting up admin account...\n");

  // ─── 1. Create Supabase Auth user ──────────────────────────

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`  → Creating Supabase Auth user: ${ADMIN_EMAIL}`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  let authUserId: string;

  if (existing) {
    console.log(`  ⚠ User already exists in Supabase Auth (id: ${existing.id})`);
    authUserId = existing.id;

    // Update user metadata to ensure role is admin
    await supabase.auth.admin.updateUserById(existing.id, {
      user_metadata: { name: ADMIN_NAME, role: "admin" },
    });
    console.log("  ✓ Updated user metadata to admin role");
  } else {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD,
        email_confirm: true, // Auto-confirm so they can log in immediately
        user_metadata: {
          name: ADMIN_NAME,
          role: "admin",
        },
      });

    if (authError) {
      console.error("  ❌ Supabase Auth error:", authError.message);
      process.exit(1);
    }

    authUserId = authData.user.id;
    console.log(`  ✓ Created Supabase Auth user (id: ${authUserId})`);
  }

  // ─── 2. Create user in local database ──────────────────────

  console.log("\n  → Connecting to database...");
  const client = postgres(DATABASE_URL, {
    ssl: DATABASE_URL.includes("supabase")
      ? { rejectUnauthorized: false }
      : false,
    onnotice: () => {},
    max: 5,
  });

  const db = drizzle(client, { schema });

  // Check if user already exists in local DB
  const existingLocal = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, authUserId));

  if (existingLocal.length > 0) {
    console.log(`  ⚠ User already exists in local database`);

    // Update role to admin if not already
    if (existingLocal[0].role !== "admin") {
      await db
        .update(schema.users)
        .set({ role: "admin" })
        .where(eq(schema.users.id, authUserId));
      console.log("  ✓ Updated role to admin in local database");
    } else {
      console.log("  ✓ User is already admin in local database");
    }
  } else {
    await db.insert(schema.users).values({
      id: authUserId,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash: "managed-by-supabase",
      role: "admin",
    });
    console.log("  ✓ Created user in local database");
  }

  await client.end();

  // ─── 3. Done ───────────────────────────────────────────────

  console.log("\n✅ Admin account setup complete!\n");
  console.log("📋 Login credentials:");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log("\n🌐 Go to http://localhost:5173/login to sign in.");
  console.log("   After login, you'll be redirected to the admin dashboard.\n");
}

setupAdmin().catch((err) => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
