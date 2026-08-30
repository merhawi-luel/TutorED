import dotenv from 'dotenv';
dotenv.config();
import { db } from '../server/db';
import { vacancies } from '../server/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    const rows = await db.select().from(vacancies).where(eq(vacancies.status, 'open'));
    console.log('Rows:', rows.length);
    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      console.log('Columns:', keys);
      console.log('Sample parentId:', (rows[0] as any).parentId);
      console.log('Sample organizationId:', (rows[0] as any).organizationId);
      // Find grade 8
      const g8 = rows.find(r => r.title.includes('Grade 8'));
      if (g8) {
        console.log('Grade 8 parentId:', (g8 as any).parentId);
      }
    }
  } catch(e: any) {
    console.error('Error:', e.message);
  }
}
main().finally(() => process.exit());
