# Vocabulary Backend API

RESTful API cho ứng dụng quản lý & học từ vựng tiếng Anh.
Stack: **Node.js + Express.js + Supabase (Postgres) + Gemini AI (@google/genai)**.

## 1. Cấu trúc thư mục

```
vocab-backend/
├── config/
│   ├── supabaseClient.js   # Khởi tạo Supabase client (service role key)
│   └── geminiClient.js     # Khởi tạo Gemini client + System Prompt sinh bài tập
├── middlewares/
│   ├── authMiddleware.js   # Xác thực JWT + phân quyền theo role
│   ├── validateExercises.js # Validate JSON schema bài tập (Ajv)
│   └── errorHandler.js     # asyncHandler, ApiError, error/404 handler tập trung
├── controllers/
│   ├── authController.js
│   ├── teacherController.js
│   ├── attemptController.js
│   └── dashboardController.js
├── routes/
│   ├── authRoutes.js
│   ├── teacherRoutes.js
│   └── attemptRoutes.js
├── utils/
│   ├── jwt.js
│   └── scoring.js          # Logic chấm điểm attempt
├── sql/schema.sql           # SQL tạo bảng trên Supabase
├── server.js
├── package.json
└── .env.example
```

## 2. Cài đặt & chạy local

```bash
npm install
cp .env.example .env
# điền SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, GEMINI_API_KEY, FRONTEND_ORIGIN
npm run dev
```

Chạy file `sql/schema.sql` trong Supabase SQL Editor để tạo bảng `classes`, `students`, `sessions`, `exercises`, `attempts`.

> Lưu ý: Backend dùng `SUPABASE_SERVICE_ROLE_KEY` (không phải anon key) vì hệ thống tự quản lý xác thực bằng JWT riêng (không dùng Supabase Auth). Vì vậy tuyệt đối không để lộ key này ra frontend — chỉ set trong biến môi trường server.

## 3. Deploy lên Render

1. Push code lên GitHub.
2. Trên Render: **New → Web Service**, kết nối repo.
3. Build Command: `npm install`. Start Command: `npm start` (đã cấu hình sẵn trong `package.json`).
4. Khai báo Environment Variables giống `.env.example` (Render → Settings → Environment).
5. `FRONTEND_ORIGIN` set đúng domain Netlify của frontend, ví dụ: `https://your-app.netlify.app`. Có thể liệt kê nhiều domain cách nhau dấu phẩy (kể cả `http://localhost:5173` khi cần test).
6. Render tự cấp domain dạng `https://xxx.onrender.com` — đây là `API_BASE_URL` frontend sẽ gọi tới.

## 4. Xác thực & phân quyền

- Học sinh đăng nhập qua `POST /api/auth/login` (chỉ cần `full_name`) → nhận JWT chứa `student_id`, `class_id`, `role: student`.
- Mọi route học sinh (`/api/attempts/*`) yêu cầu header:
  `Authorization: Bearer <token>`.
- Route giáo viên (`/api/teacher/*`) yêu cầu JWT có `role: teacher`. Hệ thống hiện chưa định nghĩa luồng đăng nhập giáo viên trong đề bài — có thể bổ sung tương tự `authController.login` (sinh token bằng `signTeacherToken`) hoặc tích hợp SSO riêng tuỳ nhu cầu thực tế; middleware `requireRole('teacher')` đã sẵn sàng dùng ngay khi có luồng đó.

## 5. Danh sách Endpoints

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Đăng nhập học sinh bằng `full_name` |
| POST | `/api/teacher/generate-exercises` | teacher | AI (Gemini) sinh 4 dạng bài tập, tạo session DRAFT |
| PUT | `/api/teacher/update-exercises/:session_id` | teacher | Chỉnh sửa nội dung bài tập (chỉ khi DRAFT) |
| PUT | `/api/teacher/publish-session/:session_id` | teacher | Giao bài (DRAFT → PUBLISHED) |
| GET | `/api/teacher/dashboard/:class_id` | teacher | Thống kê tiến độ lớp học |
| POST | `/api/attempts/start` | student | Bắt đầu lượt làm bài mới |
| PUT | `/api/attempts/update-step` | student | Cập nhật bước làm bài (anti-cheat) |
| POST | `/api/attempts/submit` | student | Nộp bài, chấm điểm, trả kết quả |

## 6. Quy tắc nghiệp vụ quan trọng

- **Anti-cheat bước làm bài**: học sinh chỉ được chuyển từ bước N-1 sang N, không được nhảy cóc.
- **Submit nghiêm ngặt**: chỉ chấp nhận nộp bài khi `current_step === 4`.
- **Ngưỡng đạt**: `PASS_THRESHOLD_PERCENT` (mặc định 80%).
  - `PASSED`: trả về toàn bộ câu (đúng/sai) kèm đáp án đúng.
  - `FAILED`: chỉ trả về các câu sai, **không** kèm đáp án đúng.
- **Update bài tập**: không cho sửa khi session đã `PUBLISHED`, tránh học sinh đang làm bài bị lệch dữ liệu.

## 7. Ví dụ request

**Đăng nhập:**
```json
POST /api/auth/login
{ "full_name": "Nguyễn Văn A" }
```

**Sinh bài tập AI:**
```json
POST /api/teacher/generate-exercises
Authorization: Bearer <teacher_token>
{ "class_id": "uuid-lop-hoc", "vocabulary_list": "apple, banana, diligent, generous" }
```

**Nộp bài:**
```json
POST /api/attempts/submit
Authorization: Bearer <student_token>
{
  "attempt_id": "uuid",
  "duration_seconds": 180,
  "answers": {
    "match_up": [{ "id": "m1", "matched_id": "m1" }],
    "fill_in_blanks": [{ "id": "b1", "student_answer": "diligent" }],
    "mcqs": [{ "id": "q1", "student_answer": "A. hardworking" }]
  }
}
```
