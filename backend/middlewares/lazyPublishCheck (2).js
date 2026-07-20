const { publishDueScheduledSessions } = require('../utils/scheduledPublish');

/**
 * Middleware "lazy check" (mục 5): trước khi trả kết quả cho các API học sinh hay
 * gọi (danh sách bài tập, bắt đầu làm bài...), tranh thủ quét và tự động chuyển
 * các session SCHEDULED đã tới giờ sang PUBLISHED — phòng trường hợp cron job nội
 * bộ lỡ nhịp vì server Render free tier bị "ngủ" (sleep) khi không có traffic.
 *
 * Không chặn response nếu quét lỗi — chỉ log lại, cron job vẫn sẽ dọn ở lượt sau.
 */
async function lazyPublishCheck(req, res, next) {
  try {
    await publishDueScheduledSessions();
  } catch (err) {
    console.error('[lazyPublishCheck] Lỗi khi kiểm tra session đến giờ hẹn:', err);
  }
  next();
}

module.exports = { lazyPublishCheck };
