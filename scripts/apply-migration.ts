import dotenv from 'dotenv';
dotenv.config();
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Applying migration: adding parent_id to vacancies...');

  try {
    await db.execute(sql`ALTER TABLE "vacancies" DROP CONSTRAINT "vacancies_organization_id_organizations_id_fk"`);
    console.log('  ✓ Dropped old FK constraint');
  } catch (e: any) {
    console.log('  ⚠ FK constraint drop:', e.message?.substring(0, 80));
  }

  try {
    await db.execute(sql`ALTER TABLE "vacancies" ALTER COLUMN "organization_id" DROP NOT NULL`);
    console.log('  ✓ Made organization_id nullable');
  } catch (e: any) {
    console.log('  ⚠ org_id nullable:', e.message?.substring(0, 80));
  }

  try {
    await db.execute(sql`ALTER TABLE "vacancies" ADD COLUMN "parent_id" uuid`);
    console.log('  ✓ Added parent_id column');
  } catch (e: any) {
    console.log('  ⚠ add parent_id:', e.message?.substring(0, 80));
  }

  try {
    await db.execute(sql`ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action`);
    console.log('  ✓ Added parent_id FK');
  } catch (e: any) {
    console.log('  ⚠ parent_id FK:', e.message?.substring(0, 80));
  }

  try {
    await db.execute(sql`ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action`);
    console.log('  ✓ Added org_id FK (nullable)');
  } catch (e: any) {
    console.log('  ⚠ org_id FK:', e.message?.substring(0, 80));
  }

  // Verify the columns exist
  const result = await db.execute(sql`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'vacancies' AND column_name IN ('organization_id', 'parent_id')`);
  console.log('\n📋 Column verification:');
  for (const row of result) {
    console.log(`  - ${row.column_name}: nullable=${row.is_nullable}`);
  }

  console.log('\n✅ Migration complete!');
}

main().catch(console.error).finally(() => process.exit());
