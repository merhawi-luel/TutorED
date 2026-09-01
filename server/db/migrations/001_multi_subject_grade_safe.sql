-- Safer migration: only runs on tables/columns that still have the old schema

-- ============================================================
-- 1. VACANCIES TABLE (skip if already done)
-- ============================================================
DO $$
BEGIN
  -- Add new columns only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacancies' AND column_name = 'subjects') THEN
    ALTER TABLE vacancies ADD COLUMN subjects text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacancies' AND column_name = 'grades') THEN
    ALTER TABLE vacancies ADD COLUMN grades text[] DEFAULT '{}';
  END IF;

  -- Migrate data only if old columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacancies' AND column_name = 'subject') THEN
    UPDATE vacancies SET subjects = ARRAY[subject] WHERE subject IS NOT NULL AND subject != '';
    ALTER TABLE vacancies DROP COLUMN subject;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacancies' AND column_name = 'grade') THEN
    UPDATE vacancies SET grades = ARRAY[grade] WHERE grade IS NOT NULL AND grade != '';
    ALTER TABLE vacancies DROP COLUMN grade;
  END IF;
END $$;

-- ============================================================
-- 2. RECRUITMENT_REQUESTS TABLE (skip if already done)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruitment_requests' AND column_name = 'subjects') THEN
    ALTER TABLE recruitment_requests ADD COLUMN subjects text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruitment_requests' AND column_name = 'grades') THEN
    ALTER TABLE recruitment_requests ADD COLUMN grades text[] DEFAULT '{}';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruitment_requests' AND column_name = 'subject') THEN
    UPDATE recruitment_requests SET subjects = ARRAY[subject] WHERE subject IS NOT NULL AND subject != '';
    ALTER TABLE recruitment_requests DROP COLUMN subject;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruitment_requests' AND column_name = 'grade') THEN
    UPDATE recruitment_requests SET grades = ARRAY[grade] WHERE grade IS NOT NULL AND grade != '';
    ALTER TABLE recruitment_requests DROP COLUMN grade;
  END IF;
END $$;
