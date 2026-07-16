-- Migration 002: Thêm cột deadline cho bảng sessions
-- Chạy file này trên Supabase SQL Editor

alter table public.sessions add column if not exists deadline timestamptz;
create index if not exists idx_sessions_deadline on public.sessions(deadline);
