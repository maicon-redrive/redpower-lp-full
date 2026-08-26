-- Migration: user data (onboarding, notes, progress, video_progress)
-- Replaces localStorage with Supabase tables

-- 1. Onboarding
CREATE TABLE user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  segment TEXT NOT NULL DEFAULT '',
  team_size TEXT NOT NULL DEFAULT '',
  main_challenge TEXT NOT NULL DEFAULT '',
  current_tools TEXT NOT NULL DEFAULT '',
  goal TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_onboarding" ON user_onboarding
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Notes (v2 format with topics)
CREATE TABLE user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_key TEXT NOT NULL, -- "1"-"8" or "general"
  topic_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  marker TEXT NOT NULL DEFAULT 'none', -- none, important, idea, action, question
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_key, topic_id)
);

CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_lesson ON user_notes(user_id, lesson_key);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_notes" ON user_notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Lesson progress (completed lessons)
CREATE TABLE user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_progress" ON user_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Video progress (seconds watched per lesson)
CREATE TABLE user_video_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INT NOT NULL,
  seconds INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

ALTER TABLE user_video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_video_progress" ON user_video_progress
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
