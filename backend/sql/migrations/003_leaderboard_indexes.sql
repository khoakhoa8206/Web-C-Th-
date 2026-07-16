-- Migration 003: Index hỗ trợ leaderboard query
create index if not exists idx_attempts_session_status
  on public.attempts(session_id, status);

create index if not exists idx_attempts_student_session_score
  on public.attempts(student_id, session_id, score desc, duration_seconds asc);
