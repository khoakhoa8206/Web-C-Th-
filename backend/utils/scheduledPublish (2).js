const supabase = require('../config/supabaseClient');

/**
 * Quét toàn bộ session đang ở trạng thái SCHEDULED và đã tới (hoặc quá) giờ hẹn
 * (`scheduled_publish_at <= now()`), tự động chuyển sang PUBLISHED.
 *
 * Dùng ở 2 nơi (mục 5 trong FIX_REQUESTS) để đảm bảo đúng giờ dù server Render
 * free tier có "ngủ" hay không:
 *  1. Cron job nội bộ (node-cron) chạy mỗi phút — xem server.js.
 *  2. Lazy check — gọi trước mỗi lần học sinh lấy danh sách bài tập / bắt đầu làm bài,
 *     để "vá" trường hợp cron lỡ nhịp do server sleep.
 *
 * @returns {Promise<string[]>} danh sách session_id vừa được publish (rỗng nếu không có).
 */
async function publishDueScheduledSessions() {
  const nowISO = new Date().toISOString();

  const { data: dueSessions, error: fetchError } = await supabase
    .from('sessions')
    .select('id')
    .eq('status', 'SCHEDULED')
    .lte('scheduled_publish_at', nowISO);

  if (fetchError) {
    console.error('[publishDueScheduledSessions] Lỗi truy vấn session đến giờ hẹn:', fetchError);
    return [];
  }
  if (!dueSessions || dueSessions.length === 0) {
    return [];
  }

  const ids = dueSessions.map((s) => s.id);

  const { error: updateError } = await supabase
    .from('sessions')
    .update({ status: 'PUBLISHED', published_at: nowISO, updated_at: nowISO })
    .in('id', ids);

  if (updateError) {
    console.error('[publishDueScheduledSessions] Lỗi khi tự động giao bài đến giờ hẹn:', updateError);
    return [];
  }

  console.log(`[publishDueScheduledSessions] Đã tự động giao ${ids.length} bài đến giờ hẹn:`, ids);
  return ids;
}

module.exports = { publishDueScheduledSessions };
