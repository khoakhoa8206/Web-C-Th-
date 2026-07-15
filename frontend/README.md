# Vocab App — Front-end (Student View + Teacher View)

Một dự án React (Vite) + Tailwind CSS DUY NHẤT, gộp toàn bộ Student View và
Teacher View đã làm ở các bước trước. Đã build thử thành công
(`npm run build`) trước khi bàn giao — không lỗi.

## Chạy thử

```bash
npm install
cp .env.example .env.local   # điền thông tin backend/Supabase của bạn
npm run dev                   # http://localhost:5173
npm run build                 # build ra dist/
```

**Không cấu hình `.env.local` app vẫn chạy được** ở chế độ MOCK (dữ liệu mẫu
trong bộ nhớ) để bạn xem toàn bộ giao diện trước khi nối backend thật.

## Sơ đồ điều hướng (đã gộp thành 1 router)

```
/                                   → Trang chọn vai trò (Học sinh / Giáo viên)

/student/login                      → Đăng nhập học sinh
/student                            → Chọn khối lớp (cần đăng nhập)
/student/grades/:gradeId/sessions   → Chọn buổi học
/student/practice/:sessionId        → Làm bài 4 bước (Flashcard → Nối từ → Điền từ → Trắc nghiệm)

/teacher/*                          → Master Dashboard (tab: Dashboard / Quản lý học sinh / Soạn bài AI)
```

Toàn bộ route được tải theo kiểu code-splitting (`React.lazy`) — vào `/`
chỉ tải phần cần thiết, không tải nhầm code của phía kia.

## Vì sao gộp lại thế này

Trước đó bạn nhận 2 project riêng (`student-app`, `teacher-app`) dùng chung
Design System nhưng phải tự ghép thủ công. Bản này đã:

1. **Gộp `src/components/ui/`** — dùng bản đầy đủ nhất (có thêm `Modal.jsx`,
   `Tabs.jsx` mà bản Student chưa có), xác nhận không có xung đột.
2. **Đổi tên `lib/api.js` (Student) → `lib/studentPracticeApi.js`** để không
   đụng tên với các file `lib/*Api.js` bên Teacher, và sửa lại toàn bộ import
   liên quan.
3. **Gộp hằng số `GRADES`** (trước đây định nghĩa trùng lặp ở cả 2 project)
   về một nguồn duy nhất: `src/lib/grades.js`.
4. **Nối lại routing**: Student trước đây coi `/` là trang chủ của riêng nó
   → giờ chuyển thành `/student`; thêm 1 `RoleSelectPage` làm trang `/` chung.
5. **1 file `package.json`** duy nhất gộp dependency của cả 2 (`dexie`,
   `@dnd-kit/core`, `@tanstack/react-query` từ Student + `@supabase/supabase-js`,
   `papaparse` từ Teacher).

## Cấu trúc thư mục

```
src/
├── App.jsx                  # Router gốc — xem sơ đồ điều hướng ở trên
├── main.jsx                 # Entry point, bọc QueryClientProvider
├── styles/variables.css     # Design tokens Pastel Pink dùng chung
│
├── pages/
│   ├── RoleSelectPage.jsx        # "/" — chọn vai trò
│   ├── LoginPage.jsx              # Student
│   ├── GradeSelectPage.jsx        # Student
│   ├── SessionListPage.jsx        # Student
│   ├── PracticeSessionPage.jsx    # Student
│   ├── TeacherApp.jsx             # Teacher — vỏ điều hướng 3 tab
│   ├── DashboardPage.jsx          # Teacher — Master Dashboard
│   ├── ManageStudentsPage.jsx     # Teacher — CRUD học sinh
│   └── AIGeneratorDashboard.jsx   # Teacher — Soạn bài bằng AI
│
├── components/
│   ├── ui/                  # Design System dùng chung: Button, InputField,
│   │                         # CardContainer, ProgressBar, BadgeStatus, Modal, Tabs
│   ├── practice/             # 4 bài tập + PracticeFlow + ResultScreen (Student)
│   ├── dashboard/             # FilterBar, StudentTable, StudentRow, StudentHistoryModal (Teacher)
│   ├── students/               # StudentsTable, StudentFormModal, ConfirmDeleteModal (Teacher)
│   ├── ai-generator/            # 4 bước soạn bài AI + 4 tab inline-edit (Teacher)
│   └── ProtectedRoute.jsx        # Bảo vệ route Student cần đăng nhập
│
├── hooks/
│   ├── useAuth.js, useSessionVocab.js, useOnlineSync.js   # Student
│   └── useAttemptsRealtime.js, useStudents.js              # Teacher
│
├── lib/
│   ├── grades.js               # Hằng số 5 khối lớp — DÙNG CHUNG
│   ├── studentPracticeApi.js    # Student: login, vocab, MCQ, submit kết quả
│   ├── auth.js, db.js            # Student: JWT localStorage, Dexie/IndexedDB
│   ├── supabaseClient.js          # Teacher: khởi tạo Supabase client
│   ├── attemptsApi.js              # Teacher: realtime channel + lịch sử
│   ├── studentsApi.js               # Teacher: CRUD học sinh
│   ├── sessionsApi.js                # Teacher: danh sách buổi học
│   ├── aiGeneratorApi.js              # Teacher: gọi AI + lưu draft/publish
│   ├── csvExport.js                    # Teacher: xuất báo cáo CSV
│   └── mockData.js                      # Dữ liệu mẫu dùng khi chưa nối backend
│
└── utils/
    └── jwt.js, shuffle.js       # Giải mã JWT, Fisher-Yates Shuffle
```

## Nối vào backend + database bạn đã có

Vì bạn đã có backend + database riêng, đây là các điểm cần sửa (KHÔNG cần
động vào UI):

| File cần sửa | Việc cần làm |
|---|---|
| `src/lib/studentPracticeApi.js` | Thay các hàm mock (`loginWithName`, `fetchSessionVocab`, `fetchMcqQuestions`, `submitResult`) bằng `fetch()`/SDK gọi backend thật. Giữ nguyên tên hàm + shape dữ liệu trả về để không phải sửa nơi gọi. |
| `src/lib/supabaseClient.js` | Điền `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` vào `.env.local` — nếu database của bạn không phải Supabase, thay file này bằng client tương ứng (ví dụ Axios instance) và cập nhật lại `attemptsApi.js`, `studentsApi.js`, `sessionsApi.js` theo API thật. |
| `src/lib/aiGeneratorApi.js` | Điền `VITE_AI_GENERATOR_ENDPOINT` trỏ tới endpoint backend gọi Gemini của bạn — **không gọi Gemini trực tiếp từ client**. |
| `src/lib/mockData.js` | Không cần sửa — chỉ dùng làm fallback demo, tự động bị bỏ qua khi đã cấu hình Supabase (`isSupabaseConfigured === true`). |

Schema SQL mẫu cho `students`, `sessions`, `attempts`, `lessons` (nếu bạn
dùng Postgres/Supabase) nằm trong lịch sử trao đổi trước — nếu cần mình gửi
lại riêng file `.sql`, cứ báo mình.

## Triển khai Netlify

```bash
npm run build   # publish directory: dist
```

`public/_redirects` (`/*  /index.html  200`) đã đảm bảo mọi route
(`/student/practice/...`, `/teacher`...) không bị 404 khi F5. Nhớ thêm biến
môi trường (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_AI_GENERATOR_ENDPOINT`) trong Netlify → Site settings → Environment
variables.
