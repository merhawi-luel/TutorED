import dotenv from 'dotenv';
dotenv.config();
import { db } from '../server/db';
import { vacancies, users } from '../server/db/schema';
import { eq, desc } from 'drizzle-orm';

async function main() {
  // Find the parent user in DB
  const [parentUser] = await db.select().from(users).where(eq(users.email, 'parent@test.com'));
  
  if (!parentUser) {
    console.log('⚠️  Parent user not in DB. Trying existing seed users...');
    const allUsers = await db.select().from(users);
    console.log('Existing users:', allUsers.map(u => `${u.email} (${u.role})`).join(', '));
    return;
  }

  console.log(`✅ Found parent user: ${parentUser.name} (${parentUser.id})`);

  // Create parent vacancy
  const [vacancy] = await db.insert(vacancies).values({
    parentId: parentUser.id,
    title: 'Need Grade 8 English Tutor',
    description: 'Looking for an experienced English tutor for my child',
    subject: 'English',
    grade: 'Grade 8',
    location: 'Addis Ababa',
    teachingMode: 'online',
    salary: '2000-3000 ETB',
    deadline: '2026-09-30',
    status: 'open',
  }).returning();

  console.log(`✅ Created parent vacancy: "${vacancy.title}" (ID: ${vacancy.id})`);

  // Verify all open vacancies include the parent one
  const allOpen = await db.select().from(vacancies).where(eq(vacancies.status, 'open')).orderBy(desc(vacancies.createdAt));

  console.log(`\n📋 Total open vacancies: ${allOpen.length}`);
  for (const v of allOpen) {
    const label = v.parentId ? '(parent-posted)' : '(agency-posted)';
    console.log(`  - ${v.title} ${label} | ${v.subject} | ${v.grade}`);
  }

  console.log(`\n✅ Parent vacancy is ${allOpen.find(v => v.id === vacancy.id) ? 'VISIBLE in all open listings' : 'NOT VISIBLE'}`);
}

main().catch(console.error).finally(() => process.exit());
