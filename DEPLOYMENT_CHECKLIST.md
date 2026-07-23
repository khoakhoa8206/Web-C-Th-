# 🚀 DEPLOYMENT CHECKLIST — Production Release Strategy

Complete deployment workflow for Phase 4 improvements.

---

## 📋 PRE-DEPLOYMENT (24 hours before)

### Code Review
- [ ] All 5 files reviewed by 2+ team members
- [ ] No console.error or warnings
- [ ] No TODO/FIXME comments left
- [ ] Git history clean and descriptive

### Testing
- [ ] All manual test cases passed ✅
- [ ] Lighthouse score ≥85 ✅
- [ ] Cross-browser testing done ✅
- [ ] Mobile testing done (iOS + Android) ✅
- [ ] Performance testing done (60fps) ✅

### Backend Verification
- [ ] Backend returns `correct_answer` field in FillInBlanks ✅
- [ ] MCQ `correct_answer` in options array ✅
- [ ] Retry MCQ-only endpoint tested ✅
- [ ] Error handling tested (offline, network errors) ✅

### Documentation
- [ ] API_SCHEMA.md reviewed ✅
- [ ] IMPLEMENTATION_GUIDE.md complete ✅
- [ ] README.md updated with new features ✅
- [ ] Changelog entry written ✅

---

## 🔄 DEPLOYMENT STAGES

### Stage 1: Staging Environment (2-3 hours)

```bash
# 1. Build for staging
npm run build:staging
npm run test:ci  # Run all automated tests

# 2. Deploy to staging server
npm run deploy:staging

# 3. Smoke tests on staging
# Visit: https://staging.vocab-app.com
# - [ ] Login works
# - [ ] Create session works
# - [ ] All 4 exercises render
# - [ ] Bài 3 (FillInBlanks) shows feedback
# - [ ] Bài 4 (Result) shows 2 buttons on fail
# - [ ] Performance metrics logged

# 4. Backend compatibility check
# Test against staging backend:
# - [ ] Exercises load with correct_answer field
# - [ ] Submit endpoint returns correct results
# - [ ] Retry MCQ-only works
# - [ ] Offline draft saved

# 5. Team sign-off
# [ ] Product Manager: Feature complete
# [ ] QA Lead: All tests passed
# [ ] DevOps: Deployment ready
```

### Stage 2: Canary Deployment (5-10% users, 1 hour)

```bash
# 1. Release to 5% of users
npm run deploy:canary --percentage=5

# 2. Monitor error rate
# Tools: Sentry, LogRocket, Google Analytics
# - [ ] Error rate stable (not increased >0.5%)
# - [ ] Performance metrics OK (Core Web Vitals)
# - [ ] User session duration normal

# 3. Monitor specific features
# - [ ] FillInBlanks feedback: working
# - [ ] MatchUp: no drag lag complaints
# - [ ] ResultScreen: users choosing retry options
# - [ ] Animations: smooth (no performance issues)

# 4. Check server logs
# - [ ] API errors: none or minimal
# - [ ] Database: queries normal
# - [ ] Deployments: all instances running

# If issues detected:
# [ ] Rollback immediately (see Rollback section)
# [ ] Debug locally, fix issue
# [ ] Return to Stage 1 (re-test on staging)
```

### Stage 3: Production Rollout (100% users, ongoing)

```bash
# 1. Gradual rollout: 10% → 25% → 50% → 100%
npm run deploy:prod --percentage=10  # 10%
# Wait 15 min
npm run deploy:prod --percentage=25  # 25%
# Wait 15 min
npm run deploy:prod --percentage=50  # 50%
# Wait 15 min
npm run deploy:prod --percentage=100 # 100%

# 2. Real-time monitoring
Dashboard:
┌─────────────────────────────────────────┐
│ Deployment Progress: Phase 4 Improvements │
│ Release: 100% (all users)                 │
├─────────────────────────────────────────┤
│ Error Rate: 0.02% ✅ (baseline: 0.01%)  │
│ API Latency: 145ms ✅                    │
│ Core Web Vitals: Good ✅                 │
│ Active Sessions: 1,234 ↑15%              │
├─────────────────────────────────────────┤
│ Feature Metrics:                          │
│ - MatchUp clicks: 45% using click mode    │
│ - FillInBlanks feedback: 98% accuracy     │
│ - Retry MCQ-only: 32% of failed attempts  │
│ - Animations: 0 lag complaints            │
└─────────────────────────────────────────┘

# 3. Monitor for 2 hours post-release
Alerts to watch:
- [ ] Error spike (>1% error rate)
- [ ] API timeout spike (>500ms latency)
- [ ] Database connection pool exhaustion
- [ ] Memory usage increase
- [ ] User complaints in support chat
```

---

## 🔄 ROLLBACK PLAN

### Automatic Rollback Triggers
```javascript
// Sentry/monitoring threshold alerts
IF (
  error_rate > 5%  // Increased 5x
  OR api_latency_p95 > 5s  // API is slow
  OR db_connection_pool_exhausted
  OR OOM_error
) THEN {
  TRIGGER_ROLLBACK("critical")
  NOTIFY_ONCALL()
}

IF (
  error_rate > 2%  // Increased 2x
  OR api_latency_p95 > 2s
  OR user_complaints > 10
) THEN {
  ALERT_TEAM("manual_review_needed")
}
```

### Manual Rollback Steps
```bash
# 1. Decision: Team decision to rollback
# Reason: Critical bug found, users affected

# 2. Rollback command
npm run deploy:prod --version=v1.9.5  # Previous version

# 3. Monitor rollback
# - [ ] All instances running previous version
# - [ ] Error rate returns to normal
# - [ ] Users notified of issue

# 4. Communication
- Post in #product-updates channel
- Email affected users (optional)
- Schedule post-mortem

# 5. Debugging
- Save crash logs & error traces
- Analyze root cause
- Fix issue locally
- Re-test on staging before re-release
```

### Partial Rollback (Feature Flag)
```javascript
// If only ONE feature has issue, disable it
// Keep others working (v2 design system, animations still active)

// Environment variable:
REACT_APP_FEATURE_FILLINBLANKS_FEEDBACK=false

// Then:
- Disable instant feedback display
- Fallback to v1 behavior (no feedback)
- Other exercises still v2
- Deploy only config change (fast)

// Re-enable after fix:
REACT_APP_FEATURE_FILLINBLANKS_FEEDBACK=true
```

---

## 📊 POST-DEPLOYMENT (First Week)

### Daily Monitoring
```
Day 1-3: Hourly checks
- [ ] Error rate stable
- [ ] API performance OK
- [ ] Feature metrics collected
- [ ] User feedback monitored

Day 4-7: 4x daily checks
- [ ] Error rate trends
- [ ] Performance trends
- [ ] Feature adoption metrics
- [ ] Support tickets reviewed

Metrics to track:
- Errors per minute: should be <0.5% increase
- API latency p50/p95: should be stable
- Core Web Vitals: LCP, FID, CLS should stay "Good"
- User retention: should not decrease
- Support tickets: should not increase
```

### Feature Adoption Metrics
```javascript
// Track in analytics
analytics.trackEvent("exercise_step_completed", {
  step: 2,
  input_mode: "drag",  // or "clickSelect"
  animations_fps: 60,
  duration_ms: 45000
});

analytics.trackEvent("fillblanks_feedback_shown", {
  is_correct: true,
  answer_type: "multiple"
});

analytics.trackEvent("result_retry_chosen", {
  retry_type: "mcq_only",  // or "full_restart"
  was_passed: false,
  score: 70
});
```

### Success Metrics (1 week target)
```
FillInBlanks:
- [ ] 95%+ of users use feedback feature
- [ ] Correct answers shown within 200ms
- [ ] No errors from multiple answer parsing

MatchUp:
- [ ] Click mode: 30-40% adoption rate (mobile)
- [ ] Drag mode: smooth 60fps on 95%+ of sessions
- [ ] No "lag" complaints in support

ResultScreen:
- [ ] 2-button UI working: 100% display rate
- [ ] "Làm lại bài 4": 25-35% adoption when failed
- [ ] "Ôn lại từ vựng": 65-75% adoption when failed
- [ ] Retry flow completes without errors

Design System:
- [ ] Animations load: <3s for full set
- [ ] No CSS conflicts with existing styles
- [ ] Dark mode works (if enabled): no issues
- [ ] Mobile: no layout shifts or jank
```

---

## 🔐 SECURITY CHECKLIST

Before deployment:

- [ ] No API keys in code
- [ ] No console.log() with sensitive data
- [ ] Correct answers not exposed in browser until submission
- [ ] CORS headers correct
- [ ] Rate limiting in place (prevent brute force)
- [ ] User input sanitized (in backend)
- [ ] SQL injection prevention (backend validates)
- [ ] XSS prevention (React escapes by default, confirm)
- [ ] HTTPS enforced
- [ ] CSP headers set (Content-Security-Policy)

```javascript
// Example: Before production, verify no secrets in window object
console.log(window);  // Should NOT have API keys, tokens, etc.

// Check build output
grep -r "sk_live\|PRIVATE_KEY\|SECRET" dist/
# Should return: No matches
```

---

## 📞 COMMUNICATION

### Pre-Deployment (48h before)
```
Email to: product@, support@, devops@

Subject: Phase 4 Improvements — Deployment Planned

Hi team,

We're releasing improvements to the Vocab System on [DATE] at [TIME].

Key changes:
1. MatchUp: Click-select mode + smooth animations
2. FillInBlanks: Instant feedback + show answers
3. Result Screen: 2 retry options (MCQ-only vs full restart)
4. Design: Gradients, shadows, animations

Timeline:
- Staging: Jul 20, 2:00 PM
- Canary: Jul 20, 4:00 PM (5% users)
- Production: Jul 20, 5:00 PM (100% users)

If issues: We'll rollback within 30 minutes.

Questions? Reply to this thread.
```

### Deployment Day (Kick-off)
```
Slack: #deployment

🚀 DEPLOYMENT STARTED

Phase 4 Improvements Release

Timeline:
[14:00] Staging deployment
[14:30] Canary (5%)
[14:45] Canary (25%)
[15:00] Production (10%)
[15:15] Production (25%)
[15:30] Production (50%)
[15:45] Production (100%)

Status: ⏳ In progress

Monitoring: https://monitoring.internal/phase4
```

### Deployment Complete
```
Slack: #deployment

✅ DEPLOYMENT COMPLETE

Phase 4 Improvements successfully released to 100% of users.

Metrics:
- Error rate: 0.02% (normal)
- API latency: 145ms (normal)
- Users affected: None
- Features active: All

Post-deployment monitoring: Active (48h)

Next: Success metrics review on Jul 27.
```

### Issue During Deployment
```
Slack: #deployment (urgent)

⚠️ ISSUE DETECTED

FillInBlanks feedback not loading (25% of users)
Error rate spiked to 2.3%

Action: Initiating rollback to v1.9.5
ETA: 5 minutes

Team: Check #incident channel for details
```

---

## 📝 DEPLOYMENT LOG TEMPLATE

```markdown
# Deployment Log — Phase 4 Improvements

**Date:** July 20, 2026  
**Deployer:** [Name]  
**Version:** v2.0-phase4  
**Duration:** 45 minutes  
**Status:** ✅ SUCCESS / ⚠️ PARTIAL / ❌ FAILED

## Timeline
- 14:00 UTC: Staging deployment started
- 14:10 UTC: Staging smoke tests passed ✅
- 14:30 UTC: Canary deployment (5%) started
- 14:45 UTC: Canary (25%) started
- 15:00 UTC: Production (10%) started
- 15:15 UTC: Production (25%) started
- 15:30 UTC: Production (50%) started
- 15:45 UTC: Production (100%) completed ✅

## Metrics
- Pre-deployment error rate: 0.01%
- Peak error rate: 0.03%
- Post-deployment error rate: 0.02% ✅
- API latency p95: 145ms (stable)
- Deployment success rate: 100%

## Issues Encountered
None

## Rollback Required
No

## Post-Deployment Actions
- [ ] Monitor error rate (24h)
- [ ] Monitor feature adoption (7d)
- [ ] Collect user feedback
- [ ] Success metrics review

## Sign-Off
- Deployer: [Name] ✅
- Tech Lead: [Name] ✅
- Product Manager: [Name] ✅

---

## Rollback Log (if needed)

**Rollback Time:** [if applicable]  
**Reason:** [issue description]  
**Action:** `npm run deploy:prod --version=v1.9.5`  
**Duration:** 8 minutes  
**Status:** ✅ Successful

**Post-Mortem:** [link to incident report]
```

---

## 🎯 SUCCESS CRITERIA

Release is successful if:

✅ **Functionality**
- All 4 exercises work without errors
- MatchUp: both drag and click modes operational
- FillInBlanks: instant feedback displays correctly
- ResultScreen: 2-button retry logic works

✅ **Performance**
- Lighthouse score ≥85
- Core Web Vitals: all "Good"
- Animation FPS: 60fps stable
- API latency: <200ms p95

✅ **Stability**
- Error rate: <0.5% (baseline ±0.01%)
- No critical bugs reported
- No user-blocking issues

✅ **Adoption**
- Feature flags: all enabled
- Analytics: metrics tracking
- User feedback: positive or neutral

✅ **Support**
- Support tickets: no surge
- User complaints: <5

---

## 📞 ESCALATION

**On-Call Engineer:** [Name] +1-555-XXXX  
**Tech Lead:** [Name] +1-555-XXXX  
**Product Manager:** [Name] +1-555-XXXX  

Escalation paths:
1. **Incident detected** → notify on-call
2. **Rollback needed** → call tech lead
3. **User impact** → notify product manager
4. **Critical issue** → conference call with team

---

## ✅ FINAL CHECKLIST

- [ ] All code reviewed and approved
- [ ] All tests passing (automated + manual)
- [ ] Performance benchmarked
- [ ] Backend compatibility confirmed
- [ ] Documentation updated
- [ ] Security review passed
- [ ] Team aligned on timeline
- [ ] Monitoring configured
- [ ] Rollback plan tested
- [ ] Communication templates ready
- [ ] Go/no-go decision: **GO** ✅

---

**Deployment ready!** 🚀

**Release date:** July 20, 2026  
**Estimated completion:** ~1 hour  
**Risk level:** LOW (backward compatible, feature-flagged)
