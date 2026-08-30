import dotenv from 'dotenv';
dotenv.config();
import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function main() {
  const result = await db.execute(sql`SELECT id, title, organization_id, parent_id FROM vacancies WHERE title LIKE '%Grade 8%'`);
  console.log('Vacancy rows:', JSON.stringify(result, null, 2));
}
main().catch(console.error).finally(() => process.exit());
