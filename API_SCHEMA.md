# 📋 API SCHEMA — Backend Contract for Frontend v2

> **Important**: These are required fields for the frontend cải tiến (Phase 4) to work properly.

---

## 🔗 Endpoint: `/api/sessions/:sessionId/exercises`

### Request
```http
GET /api/sessions/{sessionId}/exercises
Authorization: Bearer {token}
```

### Response (200 OK)
```json
{
  "session_id": "sess_abc123",
  "exercises": {
    "flashcards": [...],
    "match_up": [...],
    "fill_in_blanks": [...],
    "mcqs": [...]
  }
}
```

---

## 📦 DATA SCHEMAS

### 1. Flashcards
```json
{
  "flashcards": [
    {
      "id": "fc_1",
      "word": "happy",
      "meaning": "vui, hạnh phúc",
      "example": "I am happy today",
      "phonetic": "/ˈhæpi/"
    }
  ]
}
```

**Requirements:**
- ✅ `id`: Unique identifier (string)
- ✅ `word`: English word (string)
- ✅ `meaning`: Vietnamese translation (string)
- ⚠️ `example`: Optional, used as phonetic display
- ⚠️ `phonetic`: Optional, displayed on flip side

---

### 2. Match Up (Nối từ)
```json
{
  "match_up": [
    {
      "id": "mu_1",
      "term": "happy",
      "definition": "vui, hạnh phúc"
    },
    {
      "id": "mu_2",
      "term": "sad",
      "definition": "buồn"
    }
  ]
}
```

**Requirements:**
- ✅ `id`: Unique identifier (string)
- ✅ `term`: English word (string)
- ✅ `definition`: Vietnamese meaning (string)

**v2 Changes:**
- ✨ Added click-select mode (no backend changes needed)
- ✨ Optimized drag-drop (client-side only)

---

### 3. Fill In Blanks (Điền từ) — ⚠️ IMPORTANT
```json
{
  "fill_in_blanks": [
    {
      "id": "fib_1",
      "direction": "en_to_vi",
      "word": "happy",
      "answer": "vui|vui vẻ|hạnh phúc",
      "correct_answer": "vui|vui vẻ|hạnh phúc"
    },
    {
      "id": "fib_2",
      "direction": "vi_to_en",
      "word": "buồn",
      "answer": "sad",
      "correct_answer": "sad"
    }
  ]
}
```

**Requirements:**
- ✅ `id`: Unique identifier (string)
- ✅ `direction`: Either `"en_to_vi"` or `"vi_to_en"` (enum)
- ✅ `word`: Source word (English if en_to_vi, Vietnamese if vi_to_en)
- ✅ `correct_answer`: **⭐ NEW REQUIRED FIELD**
  - Format: `"answer1|answer2|answer3"` (pipe-separated for multiple answers)
  - Case-insensitive comparison
  - Whitespace trimmed before comparison
  - Example: `"vui|vui vẻ|hạnh phúc"` — all three are correct

**v2 Changes:**
- ⭐ **MUST** return `correct_answer` field (or fallback to `answer` if exists)
- ✨ FillInBlanksComponent shows instant feedback with this field
- ✨ Displays correct answer immediately when student types wrong
- ✨ Supports multiple answers separated by `|`

**Migration from old schema:**
```javascript
// OLD (deprecated)
{
  "fill_in_blanks": [
    { "id": "fib_1", "direction": "en_to_vi", "word": "happy", "answer": "vui" }
  ]
}

// NEW (required)
{
  "fill_in_blanks": [
    {
      "id": "fib_1",
      "direction": "en_to_vi",
      "word": "happy",
      "answer": "vui",  // Keep for backward compatibility
      "correct_answer": "vui|vui vẻ|hạnh phúc"  // NEW: Add this
    }
  ]
}
```

---

### 4. Multiple Choice Questions (Trắc nghiệm)
```json
{
  "mcqs": [
    {
      "id": "mcq_1",
      "question": "What does 'happy' mean?",
      "options": [
        "buồn",
        "vui",
        "khát",
        "mệt"
      ],
      "correct_answer": "vui"
    }
  ]
}
```

**Requirements:**
- ✅ `id`: Unique identifier (string)
- ✅ `question`: Question text (string)
- ✅ `options`: Array of option texts (string[])
- ✅ `correct_answer`: Correct option text (must be in options array)

**v2 Changes:**
- ✨ Frontend now supports retry MCQ-only (no backend changes needed)
- ✨ Keep `correct_answer` hidden during test (student doesn't see)
- ✨ Only reveal after submission

**Important:**
- ⚠️ Frontend finds correctIndex: `options.indexOf(correct_answer)`
- ⚠️ Must ensure `correct_answer` is exact match in `options` array
- ✅ Case-sensitive matching for MCQ (unlike FillInBlanks)

---

## 🔄 Attempt Submission Flow

### Endpoint: `POST /api/attempts/:attemptId/submit`

**Request:**
```json
{
  "answers": {
    "match_up": [
      { "id": "mu_1", "matched_id": "mu_2" }
    ],
    "fill_in_blanks": [
      { "id": "fib_1", "student_answer": "vui" }
    ],
    "mcqs": [
      { "id": "mcq_1", "student_answer": "vui" }
    ]
  },
  "time_seconds": 245
}
```

**Response (200 OK):**
```json
{
  "attempt_id": "att_xyz",
  "status": "PASSED",
  "accuracy": 85,
  "correct_count": 17,
  "total_questions": 20,
  "results": [
    {
      "id": "mcq_1",
      "type": "mcq",
      "question": "What does 'happy' mean?",
      "student_answer": "vui",
      "correct_answer": "vui",
      "is_correct": true
    },
    {
      "id": "fib_1",
      "type": "fill_in_blanks",
      "sentence": "_____ has meaning _____",
      "student_answer": "sad",
      "correct_answer": "sad",
      "is_correct": true
    }
  ]
}
```

### v2 Changes:
- ✨ Support multiple MCQ submissions (for retry MCQ-only feature)
- ✨ Return full `results` array even if not all questions answered
- ✅ Backend should track multiple attempts per session

---

## 🔍 VALIDATION RULES

### FillInBlanks (Critical for v2)
```javascript
// Frontend validation (client-side)
function validateFillInBlanksSchema(items) {
  return items.every(item => {
    if (!item.id) throw new Error(`Missing id in item`);
    if (!item.word) throw new Error(`Missing word in item ${item.id}`);
    if (!["en_to_vi", "vi_to_en"].includes(item.direction)) {
      throw new Error(`Invalid direction in item ${item.id}`);
    }
    if (!item.correct_answer && !item.answer) {
      throw new Error(`Missing correct_answer/answer in item ${item.id}`);
    }
    return true;
  });
}

// Check in browser console
import { FillInBlanksComponent } from './components/practice/FillInBlanksComponent';
console.log('Schema valid:', validateFillInBlanksSchema(exercises.fill_in_blanks));
```

### MatchUp
```javascript
// Match_up items must have 1:1 correspondence
// If you have N terms, must have N definitions
// Each term.id must pair with exactly 1 definition.id

function validateMatchUpSchema(items) {
  const ids = items.map(item => item.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Duplicate IDs in match_up items');
  }
  return items.length > 0 && items.length <= 20; // Reasonable limit
}
```

### MCQ
```javascript
function validateMCQSchema(questions) {
  return questions.every(q => {
    if (!q.id || !q.question || !q.options || q.options.length < 2) {
      throw new Error(`Invalid MCQ: ${q.id}`);
    }
    if (!q.options.includes(q.correct_answer)) {
      throw new Error(`correct_answer not in options: ${q.id}`);
    }
    return true;
  });
}
```

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: FillInBlanks feedback not showing
**Cause:** Backend doesn't return `correct_answer` field  
**Fix:** Add `correct_answer` to response
```javascript
// BEFORE (broken)
{ "id": "fib_1", "word": "happy", "answer": "vui" }

// AFTER (fixed)
{ "id": "fib_1", "word": "happy", "answer": "vui", "correct_answer": "vui|vui vẻ" }
```

### Issue 2: Multiple answers not working
**Cause:** Format incorrect (space around `|`, or use comma)  
**Fix:** Use proper format `"answer1|answer2|answer3"`
```javascript
// WRONG
"correct_answer": "vui | vui vẻ | hạnh phúc"  // spaces!
"correct_answer": "vui, vui vẻ, hạnh phúc"    // commas!

// CORRECT
"correct_answer": "vui|vui vẻ|hạnh phúc"      // no spaces
```

### Issue 3: MatchUp shuffling breaks display
**Cause:** Backend returns different order each time  
**Fix:** Frontend shuffles once per session (client-side), not backend
```javascript
// Keep backend response stable
// Frontend handles shuffling in MatchUpComponent
```

### Issue 4: MCQ correct_answer mismatch
**Cause:** `correct_answer` not exact match in `options` array  
**Fix:** Ensure exact string match (case-sensitive)
```javascript
// WRONG
{
  "options": ["Vui", "sad", "tired"],
  "correct_answer": "vui"  // lowercase, but option is "Vui"
}

// CORRECT
{
  "options": ["vui", "sad", "tired"],
  "correct_answer": "vui"  // exact match
}
```

---

## 📊 MIGRATION CHECKLIST

For backends upgrading from v1 to v2:

- [ ] Check: All `fill_in_blanks` items have `correct_answer` field
- [ ] Check: `correct_answer` format is `"answer1|answer2"` (pipe-separated)
- [ ] Check: No extra spaces in `correct_answer` field
- [ ] Check: `correct_answer` value is in `options` array for MCQs
- [ ] Test: FillInBlanks feedback shows correctly
- [ ] Test: Multiple answers work (e.g., `"vui|vui vẻ"`)
- [ ] Test: Case-insensitive matching works for FillInBlanks
- [ ] Test: MCQ submission includes full `results` array
- [ ] Performance: Load test with 20+ items per exercise

---

## 🔐 SECURITY NOTES

1. **Correct answers hidden until submission**
   - Frontend: `correct_answer` only used for checking, never displayed during test
   - MCQ: Keep answers server-side, don't expose in API until submit

2. **Anti-cheat checks**
   - Validate `current_step` progression (can't skip steps)
   - Check submission time (detect too-quick submissions)
   - Validate attempt_id belongs to student

3. **Data validation**
   - Sanitize user input in `student_answer`
   - Validate submitted IDs match exercise definition
   - Log suspicious activity

---

## 📞 EXAMPLES

### Complete Exercise Response
```json
{
  "session_id": "sess_123",
  "exercises": {
    "flashcards": [
      { "id": "fc_1", "word": "happy", "meaning": "vui", "example": "I am happy" }
    ],
    "match_up": [
      { "id": "mu_1", "term": "hello", "definition": "xin chào" }
    ],
    "fill_in_blanks": [
      {
        "id": "fib_1",
        "direction": "en_to_vi",
        "word": "happy",
        "answer": "vui",
        "correct_answer": "vui|vui vẻ|hạnh phúc"
      }
    ],
    "mcqs": [
      {
        "id": "mcq_1",
        "question": "What does 'happy' mean?",
        "options": ["buồn", "vui", "khát", "mệt"],
        "correct_answer": "vui"
      }
    ]
  }
}
```

### Submission Request
```json
{
  "answers": {
    "match_up": [
      { "id": "mu_1", "matched_id": "mu_1" }
    ],
    "fill_in_blanks": [
      { "id": "fib_1", "student_answer": "vui vẻ" }
    ],
    "mcqs": [
      { "id": "mcq_1", "student_answer": "vui" }
    ]
  },
  "time_seconds": 245
}
```

### Submission Response
```json
{
  "status": "PASSED",
  "accuracy": 100,
  "correct_count": 3,
  "total_questions": 3,
  "results": [
    {
      "id": "mu_1",
      "type": "match_up",
      "student_answer": "mu_1",
      "correct_answer": "mu_1",
      "is_correct": true
    },
    {
      "id": "fib_1",
      "type": "fill_in_blanks",
      "question": "happy = ?",
      "student_answer": "vui vẻ",
      "correct_answer": "vui|vui vẻ|hạnh phúc",
      "is_correct": true
    },
    {
      "id": "mcq_1",
      "type": "mcq",
      "question": "What does 'happy' mean?",
      "student_answer": "vui",
      "correct_answer": "vui",
      "is_correct": true
    }
  ]
}
```

---

## ✅ VERIFICATION SCRIPT

Run this in browser console to verify backend compliance:

```javascript
// Paste in browser console after loading exercises
async function verifyAPISchema() {
  try {
    const res = await fetch('/api/sessions/sess_test/exercises');
    const data = await res.json();
    const { exercises } = data;

    console.log('🔍 Checking Fill In Blanks schema...');
    exercises.fill_in_blanks.forEach(item => {
      if (!item.correct_answer && !item.answer) {
        console.error(`❌ Missing correct_answer in ${item.id}`);
      } else {
        console.log(`✅ ${item.id}: ${item.correct_answer}`);
      }
    });

    console.log('🔍 Checking MCQ schema...');
    exercises.mcqs.forEach(q => {
      if (!q.options.includes(q.correct_answer)) {
        console.error(`❌ correct_answer not in options for ${q.id}`);
      } else {
        console.log(`✅ ${q.id}: correct answer found`);
      }
    });

    console.log('✅ All checks passed!');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

verifyAPISchema();
```

---

**Version:** 2.0 (Phase 4 Improvements)  
**Last updated:** July 20, 2026  
**Status:** Production Ready
