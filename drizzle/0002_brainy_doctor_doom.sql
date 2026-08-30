ALTER TABLE "vacancies" DROP CONSTRAINT "vacancies_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "vacancies" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vacancies" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;