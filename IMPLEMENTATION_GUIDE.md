# 📋 HƯỚNG DẪN TRIỂN KHAI CÁC CẢI TIẾN

Tài liệu này hướng dẫn chi tiết cách cập nhật codebase với các file cải tiến.

---

## 📦 FILE CẢN SỬA (5 files chính)

### 1. **MatchUpComponent.jsx** ✅
**Vị trí:** `frontend/src/components/practice/MatchUpComponent.jsx`

**Thay đổi chính:**
- ✨ Thêm chế độ input: `"drag"` (kéo thả) hoặc `"clickSelect"` (click ghép)
- ✨ Tối ưu animations: `transform: translate3d()`, `will-change`, GPU acceleration
- ✨ Visual feedback tốt hơn: glow effect, ring, shadow tăng khi kéo
- ✨ Nút toggle mode input ở phía trên
- ✨ Hiển thị từ đã chọn khi ở mode click

**Chi tiết logic:**
```javascript
// Mode: drag hoặc clickSelect
const [inputMode, setInputMode] = useState("drag");
const [selectedWordId, setSelectedWordId] = useState(null);

// Click-select mode:
const handleSelectWord = (wordId) => { /* toggle selected */ };
const handleClickSlot = (meaningId) => { /* ghép nếu có từ được chọn */ };

// Drag mode: giữ nguyên handleDragEnd cũ
```

**Kiểm tra:**
- [ ] Kéo thả vẫn hoạt động (desktop + mobile)
- [ ] Click mode hoạt động (click từ → click ô → ghép)
- [ ] Visual feedback rõ ràng
- [ ] Animations mượt (60fps)

---

### 2. **FillInBlanksComponent.jsx** ✅
**Vị trí:** `frontend/src/components/practice/FillInBlanksComponent.jsx`

**Thay đổi chính:**
- 🎯 **Learning Mode**: Hiển thị feedback **ngay lập tức** (instant feedback)
- 🎯 Kiểm tra đáp án sau mỗi keystroke
- 🎯 Hiển thị đáp án đúng ngay khi sai
- 🎯 Không chặn học sinh — vẫn cho phép sửa

**Chi tiết logic:**
```javascript
// Feedback state: { [itemId]: { isCorrect: bool, correctAnswer: string } }
const [feedback, setFeedback] = useState({});

// Check answer: so sánh case-insensitive, hỗ trợ multiple answers (split by |)
const checkAnswer = (studentAnswer, correctAnswers) => {
  const normalized = studentAnswer.trim().toLowerCase();
  const answers = correctAnswers.split("|").map(a => a.trim().toLowerCase());
  return answers.some(ans => ans === normalized);
};

// handleChange: gọi checkAnswer sau mỗi input
const handleChange = (id, val) => {
  onChange({ ...values, [id]: val });
  if (val.trim()) {
    const item = items.find(i => i.id === id);
    const isCorrect = checkAnswer(val, item.correct_answer || item.answer || "");
    setFeedback(prev => ({
      ...prev,
      [id]: { isCorrect, correctAnswer: item.correct_answer || item.answer || "" }
    }));
  }
};
```

**Backend yêu cầu:**
- Items phải có field `correct_answer` (hoặc `answer` as fallback)
- Format: `"answer1|answer2|answer3"` nếu có multiple answers

**Kiểm tra:**
- [ ] Feedback hiển thị đúng/sai ngay (không delay)
- [ ] Hiển thị đáp án đúng dưới input khi sai
- [ ] Cho phép sửa lại
- [ ] Không chặn submit (allFilled vẫn dựa vào `isFilled()`)

---

### 3. **ResultScreen.jsx** ✅
**Vị trí:** `frontend/src/components/practice/ResultScreen.jsx`

**Thay đổi chính:**
- 🎉 Nâng cấp UI: Gradients, animations, layout tốt hơn
- 🎉 **Khi FAIL (<80%)**: Hiển thị **2 nút retry tuỳ chọn**
  - Nút 1: "🔄 Làm lại bài 4" → `onRetryMcqOnly()`
  - Nút 2: "📚 Ôn lại từ vựng" → `onRetry()`

**Props thay đổi:**
```javascript
export default function ResultScreen({
  result,
  pendingSyncNotice,
  timerSeconds,
  onRetry,              // ← Retry from start (existing)
  onRetryMcqOnly,       // ← NEW: Retry MCQ only
  onExit,
})
```

**UI Layout khi FAIL:**
```
┌─────────────────────────────────────────┐
│  💪 CHƯA ĐẠT                            │
│  Cố lên! Hãy lựa chọn cách ôn lại...  │
│  [Score | Correct | Time]              │
└─────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ [🔄 Làm lại bài 4]  (border, light)     │
│ (Chỉ làm lại câu hỏi trắc nghiệm)       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ [📚 Ôn lại từ vựng]  (gradient, filled) │
│ (Từ đầu: Flashcard → Nối từ → ...)      │
└──────────────────────────────────────────┘

[← Về trang chủ]
```

**Kiểm tra:**
- [ ] PASS (≥80%): Hiển thị 1 nút "Tiếp tục học"
- [ ] FAIL (<80%): Hiển thị 2 nút retry
- [ ] Nút "Về trang chủ" luôn visible
- [ ] Gradients & animations đẹp

---

### 4. **PracticeFlow.jsx** ✅
**Vị trí:** `frontend/src/components/practice/PracticeFlow.jsx`

**Thay đổi chính:**
- 🔄 Thêm `handleRetryMcqOnly()`: Reset MCQ selections, giữ step 1-3 answers
- 🔄 Rename `handleRetryFromResult` → `handleRetryFromStart` (optional)
- 🔄 Truyền `onRetryMcqOnly` prop xuống ResultScreen

**Logic chi tiết:**

```javascript
// ---- RETRY MCQ ONLY ----
const handleRetryMcqOnly = useCallback(() => {
  setResult(null);
  setPhase("playing");
  setStep(4);
  // Reset MCQ selections NHƯNG giữ shuffledQuestions
  updateAnswers("mcq", (prev) => ({
    ...prev,
    selections: {},    // Xoá selections
    // shuffledQuestions: vẫn giữ (không shuffle lại)
  }));
  // Bắt đầu timer lại
  setTimerSeconds(0);
  // ✅ Giữ: answers.matchup, answers.fillblanks, attemptId
  // ✅ Không tạo attempt mới
}, [updateAnswers]);

// ---- RETRY FROM START ----
const handleRetryFromStart = useCallback(() => {
  setAnswers(makeInitialAnswers());
  setResult(null);
  setAttemptId(null);
  setTimerSeconds(0);
  setStep(1);
  setPhase("ready");  // ← Gọi handleReady để tạo attempt mới
}, []);

// ---- Component render ----
if (phase === "result" && result) {
  return (
    <ResultScreen
      result={result}
      pendingSyncNotice={pendingSyncNotice}
      timerSeconds={timerSeconds}
      onRetry={handleRetryFromStart}           // ← Existing
      onRetryMcqOnly={handleRetryMcqOnly}      // ← NEW
      onExit={handleExitAndClearDraft}
    />
  );
}
```

**Flow khi retry MCQ-only:**
1. User fail MCQ → ResultScreen
2. Chọn "Làm lại bài 4"
3. `handleRetryMcqOnly()` được gọi
4. Reset `selections` trong MCQ
5. Quay lại step 4 (không tạo attempt mới)
6. Giữ answers từ step 1-3

**Backend note:**
- Attempt vẫn giữ nguyên (không tạo mới)
- Chỉ update MCQ answers khi submit lần 2

**Kiểm tra:**
- [ ] Click "Làm lại bài 4" → quay lại step 4
- [ ] MCQ selections reset (empty)
- [ ] Step 1-3 answers giữ nguyên (không cần làm lại)
- [ ] Timer reset
- [ ] Click "Ôn lại từ vựng" → quay lại step 1

---

### 5. **variables.css** ✅
**Vị trí:** `frontend/src/styles/variables.css`

**Thay đổi chính:**
- 🎨 Thêm gradients: `--gradient-pink-coral`, `--gradient-success-teal`, etc.
- 🎨 Nâng cấp shadows: Layered shadows, glass effect
- 🎨 Thêm animations: `fadeInUp`, `slideInLeft`, `popIn`, `dragGlow`, etc.
- 🎨 Thêm easing functions: `--ease-out-quad`, `--ease-out-cubic`, etc.
- 🎨 Component utilities: `.btn-primary`, `.card-base`, `.glass`, `.input-base`

**CSS Variables chính:**
```css
/* Gradients */
--gradient-pink-coral: linear-gradient(135deg, #FF8597 0%, #FF6B7A 100%);
--gradient-success-teal: linear-gradient(135deg, #4CAF50 0%, #00BCD4 100%);

/* Shadows */
--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(217, 70, 93, 0.1);
--shadow-card-hover: 0 1px 3px rgba(0, 0, 0, 0.08), 0 20px 25px -5px rgba(217, 70, 93, 0.2);
--shadow-glass: 0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);

/* Animations */
@keyframes fadeInUp { ... }
@keyframes popIn { ... }
@keyframes dragGlow { ... }
.animate-fade-in-up { animation: fadeInUp 0.5s var(--ease-out-cubic) forwards; }
```

**Kiểm tra:**
- [ ] Buttons có gradient & hover state
- [ ] Cards có layered shadows
- [ ] Animations mượt, không delay
- [ ] Mobile responsive (shadows không quá nặng)

---

## 🚀 BƯỚC TRIỂN KHAI

### Step 1: Backup & Copy Files
```bash
# Backup codebase hiện tại
cp -r frontend frontend.backup

# Copy các file cải tiến vào codebase
cp MatchUpComponent.jsx frontend/src/components/practice/
cp FillInBlanksComponent.jsx frontend/src/components/practice/
cp ResultScreen.jsx frontend/src/components/practice/
cp PracticeFlow.jsx frontend/src/components/practice/
cp variables.css frontend/src/styles/
```

### Step 2: Kiểm tra Imports & Dependencies
Tất cả components sử dụng:
- `@dnd-kit/core` (MatchUpComponent)
- `react-router-dom` (ResultScreen)
- UI components: `Button`, `InputField`, `CardContainer`, `BadgeStatus`

✅ Đã có sẵn trong `package.json`

### Step 3: Update Backend (if needed)
**FillInBlanksComponent yêu cầu backend:**
- Items phải trả về field `correct_answer` (hoặc `answer`)
- Format: `"answer1|answer2"` để hỗ trợ multiple answers

Check backend endpoint:
```javascript
// Ví dụ: GET /api/sessions/:id/exercises
// Response:
{
  fill_in_blanks: [
    {
      id: "fib_1",
      direction: "en_to_vi",
      word: "happy",
      answer: "vui|vui vẻ|hạnh phúc",        // ← Multiple answers
      correct_answer: "vui|vui vẻ|hạnh phúc" // ← Or this field
    }
  ]
}
```

### Step 4: Test từng Component
```bash
# 1. MatchUpComponent (Bài 2)
# - Kéo thả: desktop + mobile
# - Click mode: click từ → click ô → ghép
# - Toggle button: đổi mode input

# 2. FillInBlanksComponent (Bài 3)
# - Gõ đáp án → feedback ngay
# - Kiểm tra format: case-insensitive, trim, multiple answers
# - Hiển thị đáp án đúng khi sai

# 3. ResultScreen + PracticeFlow (Bài 4 + Retry)
# - PASS (≥80%): hiển thị "Tiếp tục học"
# - FAIL (<80%): hiển thị 2 nút retry
# - Retry MCQ-only: quay lại step 4, giữ answers step 1-3
# - Retry from start: reset toàn bộ

# 4. variables.css
# - Gradients: buttons, cards
# - Shadows: nhất quán, không quá nặng
# - Animations: mượt, không glitch
```

### Step 5: Performance Audit
```bash
npm run build
# Check bundle size không tăng đáng kể

# Run Lighthouse
# Performance: ≥85
# Accessibility: ≥95 (do animations a11y)
```

---

## 📊 CHECKLIST HOÀN THÀNH

### Phase 1: MatchUp (Bài 2)
- [ ] File copied: `MatchUpComponent.jsx`
- [ ] Kéo thả hoạt động (mobile tested)
- [ ] Click mode hoạt động
- [ ] Toggle button visible & functional
- [ ] Animations mượt (60fps)
- [ ] Visual feedback (glow, ring, scale)

### Phase 2: FillInBlanks (Bài 3)
- [ ] File copied: `FillInBlanksComponent.jsx`
- [ ] Backend returns `correct_answer` field
- [ ] Instant feedback works (keystroke → feedback)
- [ ] Correct answer displayed when wrong
- [ ] Multiple answers supported (split by `|`)
- [ ] Case-insensitive checking
- [ ] Styling: colored backgrounds, badges

### Phase 3: Result Screen (Bài 4)
- [ ] File copied: `ResultScreen.jsx`
- [ ] File copied: `PracticeFlow.jsx`
- [ ] PASS: shows "Tiếp tục học" button
- [ ] FAIL: shows 2 retry options
- [ ] "Làm lại bài 4" works (MCQ only)
- [ ] "Ôn lại từ vựng" works (full restart)
- [ ] Gradients & animations applied

### Phase 4: Design System
- [ ] File copied: `variables.css`
- [ ] Tailwind config OK (no breaking changes)
- [ ] Gradients applied to buttons/cards
- [ ] Shadows: layered, consistent
- [ ] Animations: registered, no conflicts
- [ ] Dark mode (optional): tested

### Phase 5: Cross-Browser Testing
- [ ] Chrome: latest
- [ ] Firefox: latest
- [ ] Safari: iOS 14+
- [ ] Edge: latest
- [ ] Mobile: iOS Safari, Android Chrome

---

## 🐛 TROUBLESHOOTING

### MatchUp không hiển thị mode toggle
**Giải pháp:** Kiểm tra imports `Button` component
```javascript
import { Button } from "../ui";
```

### FillInBlanks feedback không hiển thị
**Giải pháp:** 
1. Check backend returns `correct_answer` field
2. Check `checkAnswer()` logic: `toLowerCase()`, `trim()`
3. Debug: `console.log(feedback)` trong `handleChange()`

### ResultScreen buttons không click
**Giải pháp:**
1. Check `onRetryMcqOnly` prop được truyền từ PracticeFlow
2. Check handler: `handleRetryMcqOnly()` registered
3. Debug: Add `console.log()` trong onClick handlers

### Animations lag/glitch
**Giải pháp:**
1. Check `will-change` applied (MatchUp)
2. Use `transform: translate3d()` (GPU accelerated)
3. Avoid `left/top` properties trong animations
4. Test on low-end device (DevTools → Throttle)

### CSS variables not loaded
**Giải pháp:**
1. Check `@tailwind` directives at top of `variables.css`
2. Check `postcss.config.js`: Tailwind plugin configured
3. Clear build cache: `rm -rf node_modules/.cache`
4. Rebuild: `npm run dev`

---

## 📞 NOTES

1. **Backward Compatibility**: Toàn bộ cải tiến **không break** existing features
2. **Mobile-first**: Click mode rất important cho touch devices
3. **Performance**: GPU-accelerated animations (transform, opacity)
4. **Accessibility**: Keyboard nav, ARIA labels, focus states

---

## ✅ SUMMARY

| Component | Status | Key Changes |
|-----------|--------|-------------|
| MatchUpComponent | ✅ | Drag + Click mode, GPU animations |
| FillInBlanksComponent | ✅ | Instant feedback, show answers |
| ResultScreen | ✅ | 2 retry options, gradients |
| PracticeFlow | ✅ | handleRetryMcqOnly logic |
| variables.css | ✅ | Gradients, shadows, animations |

**Tất cả file đã sẵn sàng deploy!** 🚀
