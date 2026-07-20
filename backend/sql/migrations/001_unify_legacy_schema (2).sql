-- Migration: align the previous vocab_system_schema.sql with backend/sql/schema.sql.
-- Run this once in Supabase SQL Editor after taking a database backup.
-- It preserves existing records and leaves legacy columns in place; the Express
-- backend only reads the canonical columns added or populated below.

begin;

-- sessions: vocabulary_raw (legacy) -> vocabulary_source (backend)
alter table public.sessions add column if not exists vocabulary_source text;
alter table public.sessions add column if not exists published_at timestamptz;
alter table public.sessions add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'sessions' and column_name = 'vocabulary_raw'
  ) then
    execute 'update public.sessions
             set vocabulary_source = coalesce(vocabulary_source, vocabulary_raw)
             where vocabulary_source is null';
  end if;
end $$;

-- exercises: convert the four legacy JSON columns into the single JSON document
-- expected by teacherController, studentController, and attemptController.
alter table public.exercises add column if not exists content jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'exercises' and column_name = 'step_1_flashcards'
  ) then
    execute 'update public.exercises
             set content = coalesce(content, jsonb_build_object(
               ''flashcards'', coalesce(step_1_flashcards, ''[]''::jsonb),
               ''match_up'', coalesce(step_2_match_up, ''[]''::jsonb),
               ''fill_in_blanks'', coalesce(step_3_fill_in_blanks, ''[]''::jsonb),
               ''mcqs'', coalesce(step_4_mcqs, ''[]''::jsonb)
             ))
             where content is null';
  end if;
end $$;

update public.exercises
set content = coalesce(content, '{"flashcards": [], "match_up": [], "fill_in_blanks": [], "mcqs": []}'::jsonb)
where content is null;

alter table public.exercises alter column content set not null;

-- attempts: retain historic data while adding the fields and state required for
-- server-side attempt progression and scoring.
alter table public.attempts add column if not exists score numeric(5,2);
alter table public.attempts add column if not exists correct_count integer;
alter table public.attempts add column if not exists total_questions integer;
alter table public.attempts add column if not exists submitted_answers jsonb;
alter table public.attempts add column if not exists updated_at timestamptz not null default now();
alter table public.attempts add column if not exists current_step integer not null default 1;
alter table public.attempts add column if not exists attempt_number integer not null default 1;
alter table public.attempts add column if not exists duration_seconds integer;
alter table public.attempts add column if not exists submitted_at timestamptz;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'attempts' and column_name = 'score_percentage'
  ) then
    execute 'update public.attempts set score = coalesce(score, score_percentage)';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'attempts' and column_name = 'answers_data'
  ) then
    execute 'update public.attempts set submitted_answers = coalesce(submitted_answers, answers_data)';
  end if;
end $$;

-- Replace the old PASSED/FAILED-only constraint so new attempts may be IN_PROGRESS.
do $$
declare constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.attempts'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.attempts drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.attempts alter column status set default 'IN_PROGRESS';
alter table public.attempts
  add constraint attempts_status_check check (status in ('IN_PROGRESS', 'PASSED', 'FAILED'));

create index if not exists idx_sessions_class_id on public.sessions(class_id);
create index if not exists idx_students_class_id on public.students(class_id);
create index if not exists idx_students_full_name on public.students(lower(full_name));
create index if not exists idx_attempts_session_student on public.attempts(session_id, student_id);

alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.exercises enable row level security;
alter table public.attempts enable row level security;

commit;
