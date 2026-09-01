-- Remove Chapa payment fields and add verification fields to organizations

-- Drop old columns
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "chapa_tx_ref";
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "refund_status";
ALTER TABLE "organizations" DROP COLUMN IF EXISTS "payment_status";

-- Drop old enum types
DROP TYPE IF EXISTS "payment_status";
DROP TYPE IF EXISTS "refund_status";

-- Add new verification columns
ALTER TABLE "organizations" ADD COLUMN "verification_status" varchar(50) DEFAULT 'unverified' NOT NULL;
ALTER TABLE "organizations" ADD COLUMN "verified_at" timestamp;
