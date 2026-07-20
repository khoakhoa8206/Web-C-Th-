const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Fail fast khi thiếu cấu hình quan trọng, tránh lỗi mơ hồ lúc runtime
  throw new Error(
    '[config/supabaseClient] Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường.'
  );
}

// Server dùng Service Role Key vì cần toàn quyền đọc/ghi (bypass RLS) sau khi
// đã tự xác thực bằng JWT riêng của hệ thống (không dùng Supabase Auth).
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = supabase;
