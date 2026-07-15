-- Unified schema for the vocabulary application.
-- This file intentionally mirrors backend/sql/schema.sql: the Express backend
-- is the sole database client and expects `exercises.content` plus IN_PROGRESS.

create extension if not exists "pgcrypto";

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_name text,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  class_id uuid not null references classes(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_students_class_id on students(class_id);
create index if not exists idx_students_full_name on students(lower(full_name));

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  vocabulary_source text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sessions_class_id on sessions(class_id);

-- One JSON document per session: { flashcards, match_up, fill_in_blanks, mcqs }.
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references sessions(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  attempt_number int not null default 1,
  current_step int not null default 1 check (current_step between 1 and 4),
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'PASSED', 'FAILED')),
  score numeric(5,2),
  correct_count int,
  total_questions int,
  duration_seconds int,
  submitted_answers jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_attempts_session_student on attempts(session_id, student_id);

-- Backend uses SUPABASE_SERVICE_ROLE_KEY; browser clients never access these tables.
alter table classes enable row level security;
alter table students enable row level security;
alter table sessions enable row level security;
alter table exercises enable row level security;
alter table attempts enable row level security;
