-- Migration: Convert subject/grade to subjects/grades arrays
-- Run this in the Supabase SQL Editor

-- ============================================================
-- 1. VACANCIES TABLE
-- ============================================================

-- Add new array columns
ALTER TABLE vacancies ADD COLUMN subjects text[] DEFAULT '{}';
ALTER TABLE vacancies ADD COLUMN grades text[] DEFAULT '{}';

-- Migrate existing data (wrap single values into arrays)
UPDATE vacancies SET subjects = ARRAY[subject] WHERE subject IS NOT NULL AND subject != '';
UPDATE vacancies SET grades = ARRAY[grade] WHERE grade IS NOT NULL AND grade != '';

-- Drop old columns
ALTER TABLE vacancies DROP COLUMN subject;
ALTER TABLE vacancies DROP COLUMN grade;

-- ============================================================
-- 2. RECRUITMENT_REQUESTS TABLE
-- ============================================================

-- Add new array columns
ALTER TABLE recruitment_requests ADD COLUMN subjects text[] DEFAULT '{}';
ALTER TABLE recruitment_requests ADD COLUMN grades text[] DEFAULT '{}';

-- Migrate existing data
UPDATE recruitment_requests SET subjects = ARRAY[subject] WHERE subject IS NOT NULL AND subject != '';
UPDATE recruitment_requests SET grades = ARRAY[grade] WHERE grade IS NOT NULL AND grade != '';

-- Drop old columns
ALTER TABLE recruitment_requests DROP COLUMN subject;
ALTER TABLE recruitment_requests DROP COLUMN grade;
