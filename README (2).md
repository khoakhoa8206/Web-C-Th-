# VocabHub — Full package

Gồm 2 phần:

- `backend/` — Node/Express + Supabase + Gemini (giữ nguyên từ bản gốc)
- `frontend/` — App Lovable mới (React 19 + TanStack Start + Tailwind v4)

## Chạy backend
```bash
cd backend
cp .env.example .env   # điền SUPABASE_*, JWT_SECRET, TEACHER_PASSWORD, GEMINI_API_KEY
npm install
node server.js
```

## Chạy frontend
```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL trỏ tới backend (mặc định http://localhost:3000)
bun install            # hoặc npm install
bun dev                # hoặc npm run dev
```

## Ghi chú
- Schema DB: `vocab_system_schema.sql` — chạy trên Supabase project của bạn.
- Frontend cần backend chạy trước để đăng nhập / lấy session / AI generator hoạt động.
