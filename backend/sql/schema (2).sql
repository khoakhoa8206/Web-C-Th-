-- ============================================================
-- SCHEMA cho ứng dụng quản lý từ vựng tiếng Anh
-- Chạy trong Supabase SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- Lớp học
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_name text,
  created_at timestamptz not null default now()
);

-- Học sinh
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  class_id uuid not null references classes(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_students_class_id on students(class_id);
create index if not exists idx_students_full_name on students(lower(full_name));

-- Session (một lần giao bài tập)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'SCHEDULED', 'PUBLISHED')),
  vocabulary_source text,
  scheduled_publish_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sessions_class_id on sessions(class_id);

-- Exercises (nội dung JSON của 4 dạng bài tập, 1-1 với session)
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references sessions(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Attempts (mỗi lượt học sinh làm bài)
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

-- Lưu ý: Server dùng SUPABASE_SERVICE_ROLE_KEY nên có thể để RLS bật để bảo vệ
-- truy cập trực tiếp từ client, vì mọi request thực tế đều đi qua backend đã xác thực JWT riêng.
alter table classes enable row level security;
alter table students enable row level security;
alter table sessions enable row level security;
alter table exercises enable row level security;
alter table attempts enable row level security;
-- Không tạo policy cho anon/authenticated => chỉ service_role (server) mới truy cập được.
