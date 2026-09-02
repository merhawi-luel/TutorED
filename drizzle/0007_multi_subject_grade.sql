-- Rename vacancies columns: subject (varchar) -> subjects (text[]), grade (varchar) -> grades (text[])
ALTER TABLE "vacancies" ADD COLUMN "subjects" text[] DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE "vacancies" ADD COLUMN "grades" text[] DEFAULT '{}';
--> statement-breakpoint
UPDATE "vacancies" SET "subjects" = ARRAY["subject"] WHERE "subject" IS NOT NULL AND "subject" != '';
--> statement-breakpoint
UPDATE "vacancies" SET "grades" = ARRAY["grade"] WHERE "grade" IS NOT NULL AND "grade" != '';
--> statement-breakpoint
ALTER TABLE "vacancies" DROP COLUMN "subject";
--> statement-breakpoint
ALTER TABLE "vacancies" DROP COLUMN "grade";
--> statement-breakpoint
-- Rename recruitment_requests columns: subject (varchar) -> subjects (text[]), grade (varchar) -> grades (text[])
ALTER TABLE "recruitment_requests" ADD COLUMN "subjects" text[] DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE "recruitment_requests" ADD COLUMN "grades" text[] DEFAULT '{}';
--> statement-breakpoint
UPDATE "recruitment_requests" SET "subjects" = ARRAY["subject"] WHERE "subject" IS NOT NULL AND "subject" != '';
--> statement-breakpoint
UPDATE "recruitment_requests" SET "grades" = ARRAY["grade"] WHERE "grade" IS NOT NULL AND "grade" != '';
--> statement-breakpoint
ALTER TABLE "recruitment_requests" DROP COLUMN "subject";
--> statement-breakpoint
ALTER TABLE "recruitment_requests" DROP COLUMN "grade";
