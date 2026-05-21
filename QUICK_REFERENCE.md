# Payment Integration - Quick Reference & Testing Guide

## What's Already Done ✅

### Backend (No Additional Changes Needed)
- ✅ 2-day trial automatically set on owner registration
- ✅ Trial automatically set when owner selects role
- ✅ Payment verification endpoint implemented (Cashfree)
- ✅ Subscription status update on successful payment
- ✅ Promo bonus (+5 months) applied if paid within 7 days

### Frontend Components Created
1. **TrialBadge.jsx** - Shows countdown timer in header
2. **TrialExpiryWarning.jsx** - Toast alert when < 24h left
3. **SubscriptionGuard.jsx** - Auto-redirects on trial expiry

### Frontend Routes Updated
- ✅ ProtectedRoute checks subscription validity
- ✅ All owner routes wrapped with SubscriptionGuard
- ✅ SelectRolePage already skips plan page for owners
- ✅ SelectPlanPage already shows promo countdown

### Frontend Context Updated
- ✅ AuthContext has `isSubscriptionValid()` helper
- ✅ Subscription status persists across logout/login

---

## Test Flow (Step-by-Step)

### 1. Test New Owner Registration Flow
```
1. Go to /register
2. Create new account with email/password
3. Complete email verification
4. Auto-login → SelectRolePage
5. Select "Owner"
6. Should go DIRECTLY to dashboard (skip SelectPlanPage)
7. Should see TrialBadge in header showing "2d 0h left" or similar
8. Database should show: subscription_status='trial', trial_end_date=+2 days
```

### 2. Test Trial Countdown Display
```
1. On dashboard, watch TrialBadge countdown
2. Timer should update every minute
3. Should show days/hours format initially
4. When < 24h, should show hours/minutes format
5. Badge should turn red when < 24h (isExpiring state)
```

### 3. Test Trial Expiry Redirect
```
Option A: Wait 2 days (not practical for testing)

Option B: Database manipulation (for testing)
1. Find test owner in database
2. Update their trial_end_date to NOW or past time
3. Refresh page or restart browser
4. Should see redirect to SelectPlanPage
5. Should NOT be able to access /owner/dashboard

Option C: Browser Developer Tools
1. Open Console in browser
2. localStorage.setItem('cached_user', JSON.stringify({...user, trial_end_date: new Date().toISOString()}))
3. Refresh page
4. Should redirect to SelectPlanPage
```

### 4. Test Logout/Login Persistence
```
1. While logged in during trial, go to logout
2. Logout
3. Login again with same account
4. Should go DIRECTLY to dashboard (not SelectPlanPage)
5. TrialBadge should still show correct countdown

If trial has expired:
1. Logout
2. Login again
3. Should redirect to SelectPlanPage
4. Should NOT see dashboard
```

### 5. Test Payment Flow
```
1. On /select-plan, click "Pay Annual Pro"
2. Cashfree payment modal opens
3. Use Cashfree sandbox test cards:
   - Success: 4111111111111111, CVV: 123, Expiry: 12/25
   - Failure: 4222222222222220, CVV: 123, Expiry: 12/25
4. Complete payment with test card
5. Should see "Verifying payment..." toast
6. Should see "Annual Pro activated!" toast
7. Should redirect to dashboard
8. subscription_status should be 'active' in localStorage/database
9. trial_end_date should show +1 year (or +17 months if within 7 days)
```

### 6. Test After Payment (Logout/Login)
```
1. Just completed payment
2. Logout
3. Login again
4. Should go DIRECTLY to dashboard
5. Should NOT see SelectPlanPage again
6. TrialBadge should NOT appear (only for 'trial' status)
7. Should be able to access all owner features
```

### 7. Test Promo Bonus Logic
```
Case A: User pays within 7 days of registration
1. Create new account at TIME_A
2. Complete payment at TIME_A + 5 days
3. Check response: is_promo_applied should be TRUE
4. trial_end_date should be +17 months (12 + 5)

Case B: User pays after 7 days
1. Create new account at TIME_A
2. Skip payment (let trial expire)
3. Go to SelectPlanPage after 2 days
4. Complete payment at TIME_A + 8 days
5. Check response: is_promo_applied should be FALSE
6. trial_end_date should be +12 months only
```

---

## Quick Test Commands

### Backend Verification
```bash
# Check if trial is set on registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","name":"Test Owner","role":"owner"}'

# Response should include:
# "subscription_status": "trial"
# "trial_end_date": (timestamp 2 days from now)
```

### Frontend Testing
```bash
# Navigate to new owner flow
npm run dev
# Then open http://localhost:5173/register

# Test redirect logic
# Go to /owner/dashboard when trial is expired
# Should redirect to /select-plan automatically
```

---

## Current File Changes Summary

### Files Created (New)
- `frontend/src/components/TrialBadge.jsx`
- `frontend/src/components/TrialExpiryWarning.jsx`
- `frontend/src/components/SubscriptionGuard.jsx`
- `PAYMENT_INTEGRATION_PLAN.md`
- `IMPLEMENTATION_COMPLETE.md`
- `CAPACITOR_MOBILE_GUIDE.md`

### Files Modified
1. **frontend/src/context/AuthContext.jsx**
   - Added `isSubscriptionValid()` function
   - Returns boolean for valid trial or active subscription

2. **frontend/src/App.jsx**
   - Updated ProtectedRoute to use `isSubscriptionValid()`
   - Wrapped all owner routes with `SubscriptionGuard`
   - Added import for SubscriptionGuard

3. **frontend/src/pages/SelectRolePage.jsx**
   - No changes (already correct)

4. **frontend/src/pages/SelectPlanPage.jsx**
   - No changes (already has promo countdown)

5. **frontend/src/components/owner/OwnerHeader.jsx**
   - Added `TrialBadge` component
   - Displays during trial period with upgrade button
   - Added useNavigate hook

6. **frontend/src/pages/owner/OwnerDashboard.jsx**
   - Added `TrialExpiryWarning` component
   - Shows warning when < 24 hours left

### Backend (No Changes Needed)
- Already handles trial setup on registration
- Already handles payment verification
- Already handles promo bonus logic

---

## Deployment Readiness

### ✅ Ready for Production
- Core payment flow implemented
- Trial system implemented
- Subscription persistence implemented
- Route protection implemented

### 🔄 Before Going Live
1. Test payment with real Cashfree sandbox credentials
2. Test with multiple browsers/devices
3. Test offline scenarios
4. Configure production Cashfree keys
5. Set up payment webhooks
6. Test payment verification endpoint
7. Create monitoring for failed payments
8. Set up support escalation process

### 📱 Mobile-Specific (Read CAPACITOR_MOBILE_GUIDE.md)
1. Install local notifications plugin
2. Implement mobile auth sync service
3. Schedule trial notifications
4. Handle deep links from payments
5. Test on physical Android/iOS devices

---

## Known Limitations & Future Enhancements

### Current Implementation
- Trial countdown visible in header (desktop + mobile)
- Warning toast when < 24 hours
- Auto-redirect on trial expiration
- Promo bonus works based on registration date

### Future Enhancements (Optional)
- SMS reminder for trial expiry
- Email reminder for trial expiry
- Grace period before hard blocking access
- Subscription renewal/auto-pay
- Multiple plan tiers (Basic, Pro, Enterprise)
- Annual vs Monthly billing options
- Bulk discount for multiple properties

---

## Important Notes for Team

### 1. Trial Start Date
- Trial always starts from registration date (server-side)
- Cannot be manually extended via UI
- Users cannot get multiple trials

### 2. Subscription Status Values
- `'none'`: No subscription or trial
- `'trial'`: Active 2-day free trial
- `'active'`: Paid subscription valid
- `'expired'`: Trial or subscription expired (rare to see in DB, usually state changes immediately)

### 3. Source of Truth
- Server is ALWAYS the source of truth for subscription status
- Never trust client-side dates or localStorage for authorization
- Always verify `trial_end_date` on server before granting dashboard access
- Payment verification must hit Cashfree API, never client-side only

### 4. Critical Path
```
User Registration
  → Backend sets trial_end_date + status
  → Frontend caches user data
  → Login/Logout cycle preserves subscription status
  → Trial expiration checked both in ProtectedRoute AND SubscriptionGuard
  → Payment redirects work via backend verification
```

### 5. Mobile Considerations
- Same subscription logic applies to Capacitor app
- Need to handle app backgrounding
- Need local notifications for trial expiry
- Need to handle deep links from payment gateway
- See CAPACITOR_MOBILE_GUIDE.md for full details

---

## Support Resources

### If Users Can't Access Dashboard After Trial
1. Check `trial_end_date` in database
2. Verify server time is correct
3. Check `subscription_status` field
4. Try logout → login cycle
5. Clear browser cache if needed

### If Payment Verification Fails
1. Check Cashfree dashboard for payment status
2. Verify order_id matches request/response
3. Check backend logs for verification error
4. Check if payment actually succeeded before verifying

### If Trial Badge Doesn't Show
1. Verify `subscription_status === 'trial'` in user object
2. Verify `trial_end_date` is valid date string
3. Check browser console for component render errors
4. Refresh page to reload cached user data

---

## Quick Links
- 📋 Full Payment Plan: [PAYMENT_INTEGRATION_PLAN.md](./PAYMENT_INTEGRATION_PLAN.md)
- ✅ Implementation Status: [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)
- 📱 Mobile Setup: [CAPACITOR_MOBILE_GUIDE.md](./CAPACITOR_MOBILE_GUIDE.md)
- 🔧 Database Schema: [supabase_schema.sql](./supabase_schema.sql)

---

## Next Actions

### Immediately (Today)
1. ✅ Read this file
2. ✅ Review PAYMENT_INTEGRATION_PLAN.md
3. ✅ Deploy frontend changes to staging
4. Run manual tests from "Test Flow" section above

### This Week
1. Test payment flow with Cashfree sandbox
2. Test mobile app (if available)
3. Create test user accounts for QA
4. Document any issues found

### Before Production
1. Switch to Cashfree production credentials
2. Set up payment webhook monitoring
3. Create admin dashboard for subscription tracking
4. Prepare support documentation
5. Final round of testing across all scenarios

---

**Status**: ✅ Implementation Complete - Ready for Testing

Last Updated: May 21, 2026
