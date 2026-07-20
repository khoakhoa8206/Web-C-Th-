-- Migration 004: Thêm tính năng "hẹn giờ giao bài" (scheduled publish)
-- Chạy file này trên Supabase SQL Editor

-- 1. Thêm cột lưu thời điểm sẽ tự động giao bài
alter table public.sessions add column if not exists scheduled_publish_at timestamptz;
create index if not exists idx_sessions_scheduled_publish_at on public.sessions(scheduled_publish_at)
  where status = 'SCHEDULED';

-- 2. Mở rộng check constraint của status để thêm trạng thái SCHEDULED
-- (Supabase/Postgres không cho sửa trực tiếp check constraint, phải drop rồi tạo lại)
alter table public.sessions drop constraint if exists sessions_status_check;
alter table public.sessions add constraint sessions_status_check
  check (status in ('DRAFT', 'SCHEDULED', 'PUBLISHED'));
