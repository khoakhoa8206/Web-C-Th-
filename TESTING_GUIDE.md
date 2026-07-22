# 🧪 TESTING GUIDE — Verify Phase 4 Improvements

Complete testing procedures for all 4 exercises + UI/UX changes.

---

## ✅ TEST CHECKLIST

### Phase 1: MatchUp Component (Bài 2)

#### Test 1.1: Drag-Drop Mode (Default)
```
Setup:
- Navigate to exercise → Step 2 (MatchUp)
- Mode toggle should show: "🖱 Kéo thả" (active), "👆 Click ghép" (inactive)

Steps:
1. Try drag first word → Drop on random meaning
   ✓ Word should move smoothly (transform, not jump)
   ✓ Meaning slot should show highlight when hovering
   ✓ Word should return if dropped outside slots
   ✓ Paired word shows in the slot

2. Try dragging the same word again to another slot
   ✓ Old slot should clear (previous pair removed)
   ✓ Word should snap to new slot
   ✓ Correct counter updates

3. Try "kéo đè" — drag word to a slot that already has another word
   ✓ Old word should be kicked out (return to left column)
   ✓ New word takes the slot

Expected: 60fps smooth animation, no lag on desktop or mobile
```

#### Test 1.2: Click-Select Mode
```
Setup:
- Click "👆 Click ghép" button
- Mode toggle should switch (active state change)
- Right column background should indicate "interactive"

Steps:
1. Click first word in left column
   ✓ Word should highlight (pink background)
   ✓ Badge "Đã chọn: [word name]" appears above column
   ✓ "Hủy" button visible

2. Click a meaning slot in right column
   ✓ Word should pair with meaning
   ✓ Selection should clear
   ✓ Correct counter updates
   ✓ Word disappears from left column

3. Try clicking same word again to deselect
   ✓ Selection clears
   ✓ Badge disappears

4. Try click-to-select when already selected, select different word
   ✓ Previous selection replaces with new

5. Click "Hủy" button to deselect
   ✓ Selection clears immediately
   ✓ Badge disappears

Expected: Smooth UX on both desktop and mobile (touch)
```

#### Test 1.3: Mode Switching
```
Steps:
1. Start in drag mode, make some pairs
   ✓ Pairs saved in state

2. Switch to click mode
   ✓ Pairs should remain (preserved)
   ✓ UI switches to click-select layout
   ✓ Previous selections cleared (selectedWordId reset)

3. Make new pairs in click mode

4. Switch back to drag mode
   ✓ All previous pairs remain
   ✓ UI switches to drag layout
   ✓ Animations smooth

Expected: All pairs preserved when switching modes
```

#### Test 1.4: Visual Feedback (Animations)
```
Drag mode:
- [ ] Dragging word: shadow increases, scale up 110%, glow ring appears
- [ ] Hover over word: border color brightens
- [ ] Hover over slot: background changes, border glows pink
- [ ] Drop success: smooth transition

Click mode:
- [ ] Selected word: pink background, ring-2 ring-pink-400
- [ ] Hover slot when word selected: background brightens
- [ ] Badge: smooth fade-in, text bold

Transitions:
- [ ] All animations: <300ms (not sluggish)
- [ ] No jank or frame drops on mid-range device
```

#### Test 1.5: Responsive (Mobile Testing)
```
iPhone (iOS Safari):
- [ ] Buttons visible & tappable (≥44px touch target)
- [ ] Drag mode: smooth on iOS (check TouchSensor config)
- [ ] Click mode: works better than drag on touch
- [ ] Portrait & landscape: layout adjusts

Android (Chrome):
- [ ] Same as iOS
- [ ] Hardware acceleration enabled
- [ ] No lag even on older devices

Tablet:
- [ ] Grid layout: both columns visible
- [ ] Touch events: working
- [ ] Buttons: appropriately sized
```

---

### Phase 2: FillInBlanks Component (Bài 3)

#### Test 2.1: Instant Feedback — Correct Answer
```
Setup:
- Navigate to Step 3 (FillInBlanks)
- Backend returns items with correct_answer field

Steps:
1. Type correct answer (e.g., "vui")
   ✓ Feedback badge appears: "✓ Chính xác" (green)
   ✓ Card background: light green
   ✓ Correct counter increments

2. Keep typing (add space, extra characters)
   ✓ Feedback updates in real-time
   ✓ Returns to green if back to correct

Expected: Feedback latency <100ms (feels instant)
```

#### Test 2.2: Instant Feedback — Wrong Answer
```
Steps:
1. Type wrong answer (e.g., "sad" when correct is "vui")
   ✓ Feedback badge appears: "✗ Chưa đúng" (red)
   ✓ Card background: light red
   ✓ Correct answer shown below input:
     - "Đáp án đúng: vui|vui vẻ|hạnh phúc"
     - Text bold, green color
   ✓ Correct counter does NOT increment

2. Clear input
   ✓ Feedback badge disappears
   ✓ Correct answer box disappears
   ✓ Card returns to white background

Expected: Answer display immediate, correct styling applied
```

#### Test 2.3: Multiple Answers Support
```
Setup:
- Backend returns: correct_answer = "vui|vui vẻ|hạnh phúc"

Steps:
1. Type "vui"
   ✓ Marked correct ✓

2. Type "vui vẻ"
   ✓ Marked correct ✓

3. Type "hạnh phúc"
   ✓ Marked correct ✓

4. Type "happy"
   ✓ Marked wrong ✗

5. Type "Vui" (capital V)
   ✓ Marked correct ✓ (case-insensitive)

6. Type " vui " (spaces before/after)
   ✓ Marked correct ✓ (trimmed)

Expected: All variations accepted, case-insensitive
```

#### Test 2.4: UI/Styling
```
States to check:
- [ ] Unfilled input: white card, no feedback
- [ ] Filled correct: green card, green badge "✓"
- [ ] Filled wrong: red card, red badge "✗", green answer box
- [ ] Input focus: border glow, focus ring visible
- [ ] Correct counter: "X/Y" shown, updates real-time

Colors:
- [ ] Success: #E8F5E9 (bg), #2E7D32 (text)
- [ ] Danger: #FFEBEE (bg), #C62828 (text)
- [ ] Consistent with design system
```

#### Test 2.5: Submit Behavior (allFilled check)
```
Steps:
1. Leave 1 input empty
   ✓ Submit button disabled
   ✓ Button text: "Điền hết để tiếp tục"

2. Fill all inputs (even if wrong)
   ✓ Submit button enabled
   ✓ Button text: "Tiếp theo →"
   ✓ Can submit even with wrong answers (learning mode!)

Expected: Only checks "filled", not "correct"
```

---

### Phase 3: ResultScreen (Bài 4) & Retry Logic

#### Test 3.1: PASS Result (≥80%)
```
Setup:
- Submit MCQ with ≥80% score
- E.g., 17/20 correct = 85%

Expected display:
- [ ] Emoji: 🎉 (celebration)
- [ ] Heading: "HOÀN THÀNH" (gradient text)
- [ ] Score: 85%
- [ ] Correct: 17/20
- [ ] Time: MM:SS format
- [ ] Badge: "Hoàn thành" with animation
- [ ] Section: "Chi tiết bài làm" (collapsible or shown)
- [ ] Buttons:
  - [ ] "Tiếp tục học" (primary gradient button)
  - [ ] "← Về trang chủ" (ghost button)

Check styling:
- [ ] Gradients applied (pink-coral)
- [ ] Shadows: layered shadows on cards
- [ ] Animations: bounce emoji, fade-in cards
- [ ] Color scheme: consistent with design system
```

#### Test 3.2: FAIL Result (<80%)
```
Setup:
- Submit MCQ with <80% score
- E.g., 14/20 correct = 70%

Expected display:
- [ ] Emoji: 💪 (encouraged)
- [ ] Heading: "CHƯA ĐẠT" (no detail section)
- [ ] Score: 70%
- [ ] Correct: 14/20
- [ ] Message: "Cố lên! Hãy lựa chọn cách ôn lại..."
- [ ] NO "Chi tiết bài làm" section visible
- [ ] Buttons: TWO retry options
  - [ ] Button 1: "🔄 Làm lại bài 4"
    - Text: "(Chỉ làm lại câu hỏi trắc nghiệm)"
    - Style: outline, border-pink-300, hover:bg-pink-50
  - [ ] Button 2: "📚 Ôn lại từ vựng"
    - Text: "(Từ đầu: Flashcard → Nối từ → ...)"
    - Style: gradient, filled, primary style
  - [ ] "← Về trang chủ" (ghost button)

Check styling:
- [ ] 2 buttons visible, clear visual distinction
- [ ] Descriptive text under each button
- [ ] Both clickable and working
```

#### Test 3.3: Retry MCQ Only
```
Setup:
- User in FAIL state (<80%)
- Clicks "Làm lại bài 4"

Expected flow:
- [ ] ResultScreen closes
- [ ] Back to step 4 (MCQ page)
- [ ] MCQ selections cleared (no previous answers shown)
- [ ] MCQ questions visible (same or shuffled?)
- [ ] Timer resets
- [ ] Previous step answers (1-3) preserved (silent)

Steps:
1. Make new MCQ answers
2. Submit again
3. Get new score
4. Should NOT trigger new attempt on backend
   (Reuse existing attemptId)

Expected: Efficient retry, no need to redo steps 1-3
```

#### Test 3.4: Retry Full (From Start)
```
Setup:
- User in FAIL state (<80%)
- Clicks "Ôn lại từ vựng"

Expected flow:
- [ ] ResultScreen closes
- [ ] Back to step 1 (VocabReviewStep)
- [ ] All answers cleared (fresh start)
- [ ] Timer resets
- [ ] New attempt created (new attemptId)
- [ ] All cards shuffled/randomized

Steps:
1. Go through Flashcard → MatchUp → FillInBlanks → MCQ
   - [ ] Cards may have different order (shuffled)
   - [ ] MCQ questions may have different order
2. Submit again
3. Should be independent attempt (separate submission)

Expected: True full reset, learn from mistakes
```

#### Test 3.5: Edge Cases
```
Test 3.5a: Exactly 80% (boundary)
- Setup: 16/20 correct = 80%
- Expected: Should PASS (≥80% inclusive)
- Display: Shows "HOÀN THÀNH" (single button)

Test 3.5b: 79% (just fail)
- Setup: 15.8/20 = 79%
- Expected: Should FAIL (<80%)
- Display: Shows "CHƯA ĐẠT" (two buttons)

Test 3.5c: Offline/sync issues
- Setup: Submit but network error
- Expected: Should still show result with notice
- Display: "⏳ Kết quả đang chờ đồng bộ..." banner

Test 3.5d: Pending sync notice
- After "Làm lại bài 4", should sync old attempt first
- Check localStorage/draft preserved
```

---

### Phase 4: Design System & Animations

#### Test 4.1: Gradients
```
Elements to check:
- [ ] Primary buttons: gradient pink-coral
- [ ] Hover state: gradient brightens
- [ ] Card backgrounds: subtle gradient overlay (optional)
- [ ] Result screen: gradient backgrounds
- [ ] Text gradients: if used

DevTools check:
- Inspect element
- Check computed background-image or background properties
- Should show linear-gradient(135deg, ...)
```

#### Test 4.2: Shadows
```
Elements to check:
- [ ] Cards: initial shadow (soft) → hover shadow (lifted)
- [ ] Buttons: shadow-button on normal, shadow-button-hover on hover
- [ ] Glass effect: deep shadow if used (modals)
- [ ] Layered effect: multiple box-shadows

Visual check:
- No shadow clipping
- Shadows visible and consistent
- Performance: doesn't drop FPS when scrolling cards with shadows
```

#### Test 4.3: Animations
```
Check each animation:
- [ ] fadeInUp: Cards/items appear with slide-up
- [ ] popIn: Success/error feedback appears with pop
- [ ] bounceSlightly: Icons bounce
- [ ] dragGlow: During drag, glow effect
- [ ] pulse-soft: Badges pulse gently

Criteria:
- [ ] Smooth (60fps on modern device)
- [ ] Not jittery or glitchy
- [ ] Respects prefers-reduced-motion
- [ ] <500ms duration (not too long)
```

#### Test 4.4: Typography
```
Check:
- [ ] Heading sizes: h1 > h2 > h3
- [ ] Font weights: consistent (400, 600, 700)
- [ ] Line height: comfortable (not too tight)
- [ ] Letter spacing: headings slightly reduced
- [ ] Readability: good contrast

On different devices:
- [ ] Desktop: font size appropriate
- [ ] Mobile: scaled down but still readable
- [ ] Tablet: optimal width
```

#### Test 4.5: Dark Mode (Optional)
```
If dark mode enabled:
- [ ] Toggle available in settings
- [ ] Colors adapt: backgrounds darken, text lightens
- [ ] Readability: maintained
- [ ] Gradients: adjusted for dark background
- [ ] Shadows: still visible (not black on black)
```

---

## 🚀 PERFORMANCE TESTING

### Test 5.1: Lighthouse Score
```bash
npm run build
npm run preview

# Open DevTools → Lighthouse
# Run audit for all pages

Targets:
- Performance: ≥85
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥90
```

### Test 5.2: Animation Performance
```
DevTools → Performance:
1. Record 5 seconds of MatchUp drag interactions
2. Check frame rate graph
   - Should stay near 60fps
   - No long red bars (dropped frames)
3. Check CPU usage
   - Smooth, not spiking

On low-end device (DevTools throttle):
1. Throttle CPU to 4x slowdown
2. Test animations still smooth (15-30fps is OK)
```

### Test 5.3: Bundle Size
```bash
npm run build

# Check output
# CSS should: +2-3KB (new animations)
# JS should: no significant increase (<1%)
# Total: should not exceed reasonable budget
```

---

## 📱 CROSS-BROWSER TESTING

| Browser | Version | Desktop | Mobile | Notes |
|---------|---------|---------|--------|-------|
| Chrome | Latest | ✅ | ✅ | Baseline |
| Firefox | Latest | ✅ | ⚠️ | CSS gradients OK |
| Safari | 14+ | ✅ | ✅ | Test backdrop-blur |
| Edge | Latest | ✅ | ❌ | Desktop only |
| iOS Safari | 14+ | N/A | ✅ | Touch events |
| Android Chrome | Latest | N/A | ✅ | Standard |

---

## 🧬 UNIT TEST CASES

### MatchUpComponent
```javascript
// Test 1: Drag-drop pairs correctly
test('should create pair when dragging word to slot', () => {
  const mockOnMatchChange = jest.fn();
  render(
    <MatchUpComponent
      vocabList={mockVocab}
      matchedPairs={{}}
      onMatchChange={mockOnMatchChange}
      onNext={jest.fn()}
    />
  );
  
  // Simulate drag from word to slot
  // Assert: mockOnMatchChange called with correct pairs
});

// Test 2: Click-select mode works
test('should toggle click-select mode', () => {
  render(
    <MatchUpComponent
      vocabList={mockVocab}
      matchedPairs={{}}
      onMatchChange={jest.fn()}
      onNext={jest.fn()}
    />
  );
  
  const clickModeBtn = screen.getByText('👆 Click ghép');
  fireEvent.click(clickModeBtn);
  
  // Assert: mode changes, UI updates
});
```

### FillInBlanksComponent
```javascript
// Test 1: Instant feedback shows
test('should show correct feedback when answer is right', () => {
  render(
    <FillInBlanksComponent
      items={[{ id: '1', word: 'happy', correct_answer: 'vui|vui vẻ' }]}
      values={{ '1': 'vui' }}
      onChange={jest.fn()}
      onNext={jest.fn()}
    />
  );
  
  // Assert: badge "✓ Chính xác" visible
  expect(screen.getByText(/Chính xác/)).toBeInTheDocument();
});

// Test 2: Multiple answers
test('should accept all correct answers', () => {
  const answers = ['vui', 'vui vẻ', 'hạnh phúc'];
  
  answers.forEach(ans => {
    const result = checkAnswer(ans, 'vui|vui vẻ|hạnh phúc');
    expect(result).toBe(true);
  });
});

// Test 3: Case-insensitive
test('should be case-insensitive', () => {
  expect(checkAnswer('Vui', 'vui|vui vẻ')).toBe(true);
  expect(checkAnswer('VUI', 'vui|vui vẻ')).toBe(true);
});
```

### ResultScreen
```javascript
// Test 1: Two buttons on fail
test('should show two retry buttons on fail', () => {
  const result = { passed: false, score: 70, ... };
  render(
    <ResultScreen
      result={result}
      onRetry={jest.fn()}
      onRetryMcqOnly={jest.fn()}
      onExit={jest.fn()}
    />
  );
  
  expect(screen.getByText(/Làm lại bài 4/)).toBeInTheDocument();
  expect(screen.getByText(/Ôn lại từ vựng/)).toBeInTheDocument();
});

// Test 2: Single button on pass
test('should show single button on pass', () => {
  const result = { passed: true, score: 85, ... };
  render(<ResultScreen result={result} ... />);
  
  expect(screen.queryByText(/Làm lại bài 4/)).not.toBeInTheDocument();
  expect(screen.getByText(/Tiếp tục học/)).toBeInTheDocument();
});
```

---

## 📋 FINAL CHECKLIST

Before going live:

### Functional Testing
- [ ] All 4 exercises work correctly
- [ ] Retry logic works (both MCQ-only and full)
- [ ] State management consistent
- [ ] Draft save/load working
- [ ] Offline behavior OK

### Performance
- [ ] Lighthouse ≥85 performance
- [ ] Animations 60fps on modern devices
- [ ] Bundle size reasonable
- [ ] No console errors/warnings

### Compatibility
- [ ] Desktop: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Tablet: responsive layout
- [ ] Accessibility: WCAG 2.1 AA

### User Experience
- [ ] Visual feedback clear
- [ ] Animations smooth and delightful
- [ ] Buttons clearly labeled
- [ ] Error messages helpful
- [ ] Loading states visible

### Backend
- [ ] `correct_answer` field returned
- [ ] MCQ options validated
- [ ] Submissions logged correctly
- [ ] Retry logic tracked

---

## 🎯 SIGN-OFF

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | Khoa | Jul 20 | ✅ |
| QA | [Name] | | ⏳ |
| Product | [Name] | | ⏳ |
| Deployment | [Name] | | ⏳ |

---

**Last updated:** Jul 20, 2026  
**Version:** 2.0 Testing Guide
