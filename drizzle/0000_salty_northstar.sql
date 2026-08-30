CREATE TYPE "public"."application_status" AS ENUM('applied', 'under_review', 'shortlisted', 'interview', 'accepted', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'under_review', 'verified', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('government_id', 'degree_certificate', 'diploma', 'transcript', 'teaching_certificate', 'professional_certification', 'experience_letter');--> statement-breakpoint
CREATE TYPE "public"."teaching_mode" AS ENUM('in-person', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('tutor', 'agency', 'admin', 'parent');--> statement-breakpoint
CREATE TYPE "public"."vacancy_status" AS ENUM('open', 'closed', 'draft');--> statement-breakpoint
CREATE TYPE "public"."verification_level" AS ENUM('unverified', 'partial', 'verified', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."verification_request_status" AS ENUM('pending', 'under_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" uuid NOT NULL,
	"vacancy_id" uuid NOT NULL,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" uuid NOT NULL,
	"type" "document_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_key" text,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewer_note" text
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"org_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'recruiter' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text DEFAULT '',
	"location" varchar(255) DEFAULT '',
	"subjects" text[] DEFAULT '{}',
	"is_verified" boolean DEFAULT false NOT NULL,
	"logo_url" text,
	"owner_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"phone" varchar(50) DEFAULT '',
	"children_grades" text[] DEFAULT '{}',
	"preferred_subjects" text[] DEFAULT '{}',
	"location" varchar(255) DEFAULT '',
	"notes" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "recruitment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"organization_id" uuid,
	"subject" varchar(255) NOT NULL,
	"grade" varchar(100) NOT NULL,
	"location" varchar(255) DEFAULT '',
	"notes" text DEFAULT '',
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"headline" varchar(255) DEFAULT '',
	"bio" text DEFAULT '',
	"subjects" text[] DEFAULT '{}',
	"grades" text[] DEFAULT '{}',
	"experience" integer DEFAULT 0,
	"education" varchar(255) DEFAULT '',
	"location" varchar(255) DEFAULT '',
	"teaching_mode" "teaching_mode" DEFAULT 'in-person',
	"availability" varchar(255) DEFAULT '',
	"rating" numeric(2, 1) DEFAULT '0.0',
	"application_count" integer DEFAULT 0,
	"verification_level" "verification_level" DEFAULT 'unverified' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'tutor' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vacancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text DEFAULT '',
	"subject" varchar(255) NOT NULL,
	"grade" varchar(100) NOT NULL,
	"required_education" varchar(255) DEFAULT '',
	"required_experience" integer DEFAULT 0,
	"location" varchar(255) DEFAULT '',
	"teaching_mode" "teaching_mode" DEFAULT 'in-person',
	"salary" varchar(100) DEFAULT '',
	"availability" varchar(255) DEFAULT '',
	"deadline" varchar(50) DEFAULT '',
	"status" "vacancy_status" DEFAULT 'open' NOT NULL,
	"applicant_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tutor_id" uuid NOT NULL,
	"status" "verification_request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_vacancy_id_vacancies_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_requests" ADD CONSTRAINT "recruitment_requests_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruitment_requests" ADD CONSTRAINT "recruitment_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;