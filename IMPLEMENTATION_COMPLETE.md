# Payment Integration Implementation Guide

## ✅ Completed Changes

### Frontend Components Created:
1. **TrialBadge** (`frontend/src/components/TrialBadge.jsx`)
   - Displays trial countdown in header
   - Shows expiry warnings when < 24 hours remaining
   - One-click upgrade button

2. **TrialExpiryWarning** (`frontend/src/components/TrialExpiryWarning.jsx`)
   - Toast-like warning notification
   - Shows time remaining to trial expiration
   - Dismissible UI

3. **SubscriptionGuard** (`frontend/src/components/SubscriptionGuard.jsx`)
   - Wraps owner dashboard routes
   - Checks trial/subscription validity every minute
   - Auto-redirects to SelectPlanPage on expiration

### Frontend Updates:
1. **AuthContext** (`frontend/src/context/AuthContext.jsx`)
   - Added `isSubscriptionValid()` helper function
   - Validates trial_end_date and subscription_status
   - Returns true only for valid trial or active subscriptions

2. **App.jsx** (Routing)
   - Updated `ProtectedRoute` to use `isSubscriptionValid()`
   - Wrapped all owner routes with `SubscriptionGuard`
   - Ensures strict subscription enforcement

3. **SelectRolePage** (No changes needed)
   - Backend already sets trial on role update
   - Frontend already skips SelectPlanPage for owners ✓

4. **OwnerHeader** (`frontend/src/components/owner/OwnerHeader.jsx`)
   - Added `TrialBadge` to header
   - Shows during trial period
   - Includes upgrade button

5. **OwnerDashboard** (`frontend/src/pages/owner/OwnerDashboard.jsx`)
   - Added `TrialExpiryWarning` component
   - Shows warnings when < 24 hours left

### Backend (Already Implemented):
1. **Auth Routes** (`backend/routes/auth.js`)
   - `/api/auth/register` - Sets trial for owners (2 days)
   - `/api/auth/update-role` - Sets trial on role selection
   - `/api/auth/social-sync` - Sets trial for social login owners

2. **Subscription Routes** (`backend/routes/subscription.js`)
   - `/api/subscription/verify-cashfree` - Verifies payment + sets active subscription
   - Automatically applies +5 months promo if paid within 7 days
   - Updates trial_end_date to 1 year or 17 months

3. **Cashfree Integration** (`backend/routes/cashfree.js`)
   - `/api/cashfree/create-order` - Creates ₹40,000 payment order
   - Already handles subscription and rent payments

---

## 🚀 Next Steps: Mobile & Production Setup

### 1. Capacitor Mobile Optimization

#### A. Persistent Subscription Status Check on App Startup
```typescript
// src/app.tsx or main.tsx
import { App } from '@capacitor/app';

App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    // App came to foreground - verify subscription status
    verifySubscriptionStatus();
  }
});
```

#### B. Mobile-Specific Trial Notifications
```typescript
// Install: npm install @capacitor/push-notifications

import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

// When trial is about to expire (< 24 hours)
const scheduleTrialExpiryNotification = (trialEndDate) => {
  const msUntilExpiry = new Date(trialEndDate) - new Date();
  const minutesUntilExpiry = msUntilExpiry / (1000 * 60);
  
  if (minutesUntilExpiry <= 1440) { // Less than 24 hours
    LocalNotifications.schedule({
      notifications: [
        {
          title: '⏰ Your Trial is Ending!',
          body: 'Upgrade now to keep using easyPG',
          id: 1,
          schedule: { at: new Date(Date.now() + 5000) }, // Show in 5 seconds
          actionTypeId: 'TRIAL_EXPIRY',
          extra: { navigateTo: '/select-plan' }
        }
      ]
    });
  }
};
```

#### C. Deep Linking for Payment Redirect
```typescript
// Handle deep links from notifications or external sources
App.addListener('appUrlOpen', (data: any) => {
  const slug = data.url.split('.app').pop();
  if (slug?.startsWith('/select-plan')) {
    navigate('/select-plan');
  }
});
```

### 2. Testing Checklist

#### UI/UX Testing:
- [ ] **Desktop**: Load `/owner/dashboard` → See TrialBadge with countdown
- [ ] **Mobile (Capacitor)**: Same as desktop, TrialBadge visible
- [ ] **Trial Warning**: Trigger warning with < 24 hours remaining
- [ ] **Trial Expiration**: Auto-redirect to `/select-plan` after 2 days

#### Subscription Flow:
- [ ] New Owner Registration → 2-day trial → Dashboard (no SelectPlanPage)
- [ ] After 2 days → Redirect to SelectPlanPage
- [ ] Pay within 7 days → Get 17 months total
- [ ] Pay after 7 days → Get 12 months total
- [ ] After payment → Logout/Login → Goes to Dashboard (no SelectPlanPage)

#### Edge Cases:
- [ ] Trial ends while user is logged in → Show warning, redirect after 1 min
- [ ] Trial ends while user offline → On next login, redirect to SelectPlanPage
- [ ] User manually changes `trial_end_date` in browser localStorage → Server rejects, fetches fresh data
- [ ] Multiple tabs/windows → One subscription verification per session
- [ ] Network timeout during payment verification → Show "processing" message, verify on next login

### 3. Production Deployment

#### Before Going Live:
1. **Database Migration**:
```sql
-- Verify platform_subscriptions table exists
-- Verify users table has: trial_end_date, subscription_status columns
-- Create backup of production database
```

2. **Environment Variables** (Backend):
```env
# Cashfree
CASHFREE_ENV=production
CASHFREE_APP_ID=your_prod_app_id
CASHFREE_SECRET_KEY=your_prod_secret

# Payment Verification
PAYMENT_WEBHOOK_SECRET=your_webhook_secret
```

3. **Webhook Setup** (if not already done):
- Configure Cashfree webhook to notify: `https://your-backend.com/api/cashfree/webhook`
- Set to notify on all payment status changes
- Add retry logic for failed webhook deliveries

4. **Testing in Production**:
- Use Cashfree sandbox mode first
- Test with small amounts (₹1)
- Verify payment confirmation works
- Verify subscription activation

### 4. Optional Enhancements

#### A. Admin Dashboard for Monitoring
```javascript
// backend/routes/admin.js
router.get('/api/admin/subscription-stats', requireAuth, requireAdmin, async (req, res) => {
  const stats = await supabase
    .from('users')
    .select('subscription_status, trial_end_date')
    .eq('role', 'owner');
  
  return res.json({
    total_owners: stats.data.length,
    active_trials: stats.data.filter(u => u.subscription_status === 'trial').length,
    active_subscriptions: stats.data.filter(u => u.subscription_status === 'active').length,
    expired_subscriptions: stats.data.filter(u => u.subscription_status === 'expired').length,
  });
});
```

#### B. Automated Expiry Reminders (Optional Cron Job)
```javascript
// backend/cron/subscription-reminders.js
// Run every 6 hours
const checkAndNotifyExpiringTrials = async () => {
  const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const expiringTrials = await supabase
    .from('users')
    .select('id, email, trial_end_date')
    .eq('subscription_status', 'trial')
    .lte('trial_end_date', in24Hours.toISOString());
  
  for (const user of expiringTrials.data) {
    await sendRemiderEmail(user.email);
  }
};
```

#### C. Churn Prevention (Grace Period)
```javascript
// Give 24-hour grace period after trial/subscription ends
// Allow access but show banner: "Your subscription has expired"
// After grace period, force /select-plan redirect
```

### 5. Key Files Modified

**Frontend:**
```
✅ frontend/src/context/AuthContext.jsx - Added isSubscriptionValid()
✅ frontend/src/App.jsx - Updated ProtectedRoute + Added SubscriptionGuard
✅ frontend/src/pages/SelectRolePage.jsx - No changes (works as-is)
✅ frontend/src/pages/SelectPlanPage.jsx - No changes (already complete)
✅ frontend/src/components/TrialBadge.jsx - NEW
✅ frontend/src/components/TrialExpiryWarning.jsx - NEW
✅ frontend/src/components/SubscriptionGuard.jsx - NEW
✅ frontend/src/components/owner/OwnerHeader.jsx - Added TrialBadge
✅ frontend/src/pages/owner/OwnerDashboard.jsx - Added TrialExpiryWarning
```

**Backend:**
```
✅ backend/routes/auth.js - Sets trial on registration/role-update (already done)
✅ backend/routes/subscription.js - Verifies payment + sets active (already done)
✅ backend/routes/cashfree.js - Creates payment orders (already done)
```

---

## 📊 Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ New Owner Registration                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Backend sets:                 │
        │ • trial_end_date = +2 days   │
        │ • subscription_status=trial  │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Frontend: SelectRolePage      │
        │ • Select "Owner"              │
        │ • Skip SelectPlanPage         │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Dashboard + TrialBadge        │
        │ Shows: "1d 20h left"         │
        └──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    ┌──────────────┐        ┌──────────────┐
    │ Trial expires│        │ User upgrades│
    │ after 2 days │        │ within 2 days│
    └──────────────┘        └──────────────┘
          │                         │
          ▼                         ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ Redirect to      │    │ Cashfree Payment │
    │ SelectPlanPage   │    │ ₹40,000/year     │
    └──────────────────┘    └──────────────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   ▼               ▼               ▼
            ┌─────────────┐  ┌──────────┐  ┌─────────────┐
            │ Payment OK  │  │ Fail/    │  │ Cancel      │
            │ < 7 days?   │  │ Error    │  │ Payment     │
            └─────────────┘  └──────────┘  └─────────────┘
            ┌──────┴──────┐        │             │
            ▼             ▼        │             │
        ┌────┐         ┌────┐     │             │
        │YES │         │ NO │     │             │
        └────┘         └────┘     │             │
         │               │        │             │
         ▼               ▼        ▼             ▼
    12+5=17mo        12 mo    Retry/Try    Cancelled
                               later        (stay on page)

Final State:
• subscription_status = 'active'
• trial_end_date = 12 months (or 17 with promo)
• Dashboard unlocked
• Cannot see SelectPlanPage until expiry
```

---

## 🔒 Security Considerations

1. **Never Trust Client-Side Dates**
   - Always verify `trial_end_date` on server before granting access
   - Client-side countdown is UI only, server is source of truth

2. **Subscription Status Validation**
   - On every login, fetch fresh user data from server
   - Don't rely on localStorage cache for subscription status
   - Check if trial_end_date is in the past

3. **Payment Verification**
   - Always verify with payment gateway before updating subscription status
   - Don't trust client-side callbacks
   - Implement webhook for payment confirmations

4. **Trial Period Enforcement**
   - Set trial_end_date server-side during registration (not client-side)
   - Cannot be extended manually by users
   - Only one trial per account (check if user already has subscription)

---

## 📞 Support & Troubleshooting

### Issue: User stuck on SelectPlanPage after payment
**Solution:**
1. Verify payment was successful in Cashfree dashboard
2. Check if `/api/subscription/verify-cashfree` was called
3. Check database if subscription_status was updated to 'active'
4. Have user logout and login

### Issue: Trial doesn't expire after 2 days
**Solution:**
1. Check database `trial_end_date` value
2. Verify server clock is not out of sync
3. Check browser console for `isSubscriptionValid()` logic
4. Restart browser if running old cached version

### Issue: Mobile app doesn't show trial warning
**Solution:**
1. Ensure `TrialExpiryWarning` component is rendered in dashboard
2. Check if `user.subscription_status === 'trial'` in mobile app
3. Verify `trial_end_date` is correct in user object
4. Force app refresh (pull-to-refresh or restart app)

---

## 🎯 Success Metrics

After 30 days, monitor:
- **Trial Activation Rate**: % of new owners completing 2-day trial
- **Payment Conversion Rate**: % converting from trial to paid
- **Promo Redemption**: % paying within 7 days (for +5 months bonus)
- **Churn Rate**: % not paying after trial expiration
- **Support Tickets**: Related to subscription/payment issues

Target Benchmarks:
- Trial Activation: 95%+
- Payment Conversion: 60%+
- Promo Redemption: 75%+ of converters
- Churn within 30 days: < 10%
