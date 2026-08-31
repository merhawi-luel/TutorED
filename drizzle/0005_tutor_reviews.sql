-- Add "completed" to application_status enum
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'completed' AFTER 'accepted';

-- Create tutor_reviews table
CREATE TABLE IF NOT EXISTS tutor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for looking up reviews by tutor
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_tutor_id ON tutor_reviews(tutor_id);

-- Index for looking up reviews by application (prevent duplicates)
CREATE INDEX IF NOT EXISTS idx_tutor_reviews_application_id ON tutor_reviews(application_id);

-- Unique constraint: one review per application
CREATE UNIQUE INDEX IF NOT EXISTS idx_tutor_reviews_application_unique ON tutor_reviews(application_id);
