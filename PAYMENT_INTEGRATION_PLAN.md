# Payment Integration Plan - AntiGravityHMS

## Overview
Implement a robust payment integration system with 2-day free trial for new owner registrations, automatic payment reminders after trial expiration, and strict subscription status persistence across login/logout cycles.

---

## Key Business Rules

### 1. **Owner Subscription Flow**
- **New Registration**: Automatically activate **2-day free trial** (48 hours from registration)
  - Owner → Register → Select Role (Owner) → Skip SelectPlanPage → Direct to Dashboard
  - Trial status persists in database
  - Owner can use full features during trial

- **After Trial Expiration**:
  - Automatic payment reminder appears
  - Plan: **1 Year - ₹40,000**
  - **Promo Bonus**: If paid within 7 days of registration → +5 months extra (total 17 months)
  - Payment gateway integration (Cashfree/Paytm)

- **Post-Payment**:
  - `subscription_status` → `'active'`
  - `trial_end_date` → Updated to actual expiry date (1 year from payment)
  - User sees dashboard directly on subsequent logins

### 2. **Strict Subscription Persistence Rule** ⚠️
- **CRITICAL**: Once user pays → They should NEVER see SelectPlanPage again during active subscription period
- **Logout → Login Cycle**:
  - Fetch fresh user data from database
  - Check: Is `subscription_status === 'active'` AND `trial_end_date` is in future?
  - If YES → Route directly to dashboard
  - If NO → Route to SelectPlanPage (subscription expired or trial ended)
- **Mobile & Web parity**: Same logic applies to both Capacitor and web app

### 3. **Trial to Payment Transition**
- On **trial expiration** (after 2 days), system must:
  - Check trial_end_date every time user loads dashboard
  - If expired and subscription_status still 'trial' → Show payment modal/redirect
  - NOT auto-logout; NOT force page refresh; Elegant redirect to SelectPlanPage

---

## Database Schema Updates

### Current Schema Issues
- `trial_end_date` exists but used for both trial AND subscription expiry
- `subscription_status` can be: `'none'`, `'trial'`, `'active'`, `'pending'`
- `payment_setup_complete` used for old flow (deprecated)

### Required Changes
```sql
-- No schema change needed, but clarify usage:
-- subscription_status values:
--   'none': No subscription or trial
--   'trial': In 2-day free trial period
--   'active': Paid subscription active
--   'expired': Subscription expired, payment needed

-- trial_end_date:
--   For 'trial': When 2 days end
--   For 'active': When 1-year subscription ends
--   For 'expired': Will be in the past
```

### Recommended Additions
```sql
-- Optional: Track payment history
CREATE TABLE subscription_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_status TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  amount NUMERIC,
  payment_method TEXT,
  transaction_id TEXT,
  promo_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Track trial conversions
ALTER TABLE users ADD COLUMN trial_started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN subscription_auto_renew BOOLEAN DEFAULT TRUE;
```

---

## Frontend Architecture

### 1. **Updated Routing Flow**

```
User Registration
  ├─ Email + Password → /register
  ├─ Receive email verification
  ├─ Create account
  └─ Auto-login
     └─ SelectRolePage
        ├─ Select "Owner"
        │  ├─ Backend: Set trial_end_date = now + 2 days
        │  ├─ Backend: Set subscription_status = 'trial'
        │  └─ Frontend: Navigate to /owner/dashboard (SKIP SelectPlanPage)
        └─ Select "Tenant"
           └─ Navigate to /tenant/join

Post-Login (Owner)
  ├─ Check subscription_status & trial_end_date in AuthContext
  ├─ If 'active' & valid → Dashboard ✓
  ├─ If 'trial' & valid → Dashboard + Trial Badge
  ├─ If 'trial' & EXPIRED → SelectPlanPage
  ├─ If 'none' or expired → SelectPlanPage
  └─ If 'pending' → Show loading
```

### 2. **AuthContext Enhancements**

```javascript
// Add to AuthContext.jsx
const [subscriptionStatus, setSubscriptionStatus] = useState('none');
const [trialEndDate, setTrialEndDate] = useState(null);

const checkSubscriptionStatus = useCallback(() => {
  if (!user) return;
  
  const endDate = new Date(user.trial_end_date);
  const now = new Date();
  
  if (now > endDate) {
    // Trial or subscription expired
    return 'expired';
  }
  
  return user.subscription_status; // 'trial' or 'active'
}, [user]);
```

### 3. **ProtectedRoute Logic Update**

```javascript
const ProtectedRoute = ({ children, roleType }) => {
  const { user, loadingAuth } = useAuth();
  
  if (loadingAuth && !user) return <ProgressBar />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'unassigned') return <Navigate to="/select-role" />;
  
  // NEW: Check subscription status for owners
  if (user.role === 'owner') {
    const isTrialValid = 
      user.subscription_status === 'trial' &&
      user.trial_end_date &&
      new Date(user.trial_end_date) > new Date();
    
    const isSubscriptionValid =
      user.subscription_status === 'active' &&
      user.trial_end_date &&
      new Date(user.trial_end_date) > new Date();
    
    if (!isTrialValid && !isSubscriptionValid) {
      if (window.location.pathname !== '/select-plan') {
        return <Navigate to="/select-plan" replace />;
      }
    }
  }
  
  return children;
};
```

### 4. **New Components**

#### A. **SubscriptionGuard Component**
```javascript
// frontend/src/components/SubscriptionGuard.jsx
// Wraps dashboard routes
// Checks trial expiration every minute
// Shows toast notification when approaching/past expiration
// Auto-redirects to SelectPlanPage on expiration

export const SubscriptionGuard = ({ children, user }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    if (!user?.trial_end_date || user.subscription_status === 'active') return;
    
    const checkExpiry = () => {
      const endDate = new Date(user.trial_end_date);
      const now = new Date();
      const diff = endDate - now;
      
      if (diff <= 0) {
        navigate('/select-plan', { replace: true });
      } else if (diff <= 12 * 60 * 60 * 1000) { // < 12 hours
        setShowWarning(true);
        setTimeLeft(formatTimeLeft(diff));
      }
    };
    
    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, navigate]);
  
  return <>
    {showWarning && <TrialExpiryWarning timeLeft={timeLeft} />}
    {children}
  </>;
};
```

#### B. **TrialBadge Component**
```javascript
// frontend/src/components/TrialBadge.jsx
// Show in dashboard header during trial period
// Display time left
// Link to SelectPlanPage

export const TrialBadge = ({ trialEndDate, onUpgrade }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(trialEndDate) - new Date();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`${days}d ${hours}h left`);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [trialEndDate]);
  
  return (
    <div className="trial-badge">
      <Sparkles size={16} />
      <span>{timeLeft}</span>
      <button onClick={onUpgrade}>Upgrade Now</button>
    </div>
  );
};
```

### 5. **Modified SelectRolePage**

```javascript
// In SelectRolePage.jsx - Update role selection handler
const handleRoleSelection = async (role) => {
  if (role === 'owner') {
    // Backend will auto-create trial
    const res = await api.put('/api/auth/update-role', { role });
    
    // Update context with trial info
    loginContext({
      ...res.data,
      subscription_status: 'trial',
      trial_end_date: res.data.trial_end_date,
    });
    
    // SKIP SelectPlanPage - go directly to dashboard
    navigate('/owner/dashboard', { replace: true });
  }
};
```

### 6. **Modified SelectPlanPage**

```javascript
// SelectPlanPage.jsx - Enhanced for clarity
// Show:
//   - Current trial status
//   - Days/hours remaining in trial
//   - Plan details: ₹40,000/year
//   - Promo: +5 months if paid within 7 days of registration
//   - Countdown timer for promo expiry
//   - Payment options (Cashfree/Paytm)
```

---

## Backend Endpoints

### 1. **POST /api/auth/update-role** (Existing - Modify)
```javascript
// When role is 'owner':
// - Set subscription_status = 'trial'
// - Set trial_end_date = now + 48 hours
// - Return these fields in response
```

### 2. **POST /api/subscription/verify-payment** (New)
```javascript
// After successful payment:
// - Verify with payment gateway
// - Update user.subscription_status = 'active'
// - Calculate new trial_end_date = now + 1 year
// - Check if payment within 7 days of registration
//   - If YES: trial_end_date = now + 1 year + 5 months
// - Return success with new expiry date
```

### 3. **GET /api/subscription/status** (New)
```javascript
// Check current subscription status
// Return: {
//   subscription_status: 'trial'|'active'|'expired',
//   trial_end_date: ISO datetime,
//   days_left: number,
//   hours_left: number,
//   is_trial: boolean,
//   promo_available: boolean,
//   promo_days_left: number
// }
```

### 4. **POST /api/subscription/extend-trial** (Optional)
```javascript
// For testing: Add 2 days to trial
// Only in development mode
```

---

## Implementation Sequence

### Phase 1: Backend Setup
1. Update `/api/auth/update-role` endpoint
2. Create `/api/subscription/verify-payment` endpoint
3. Create `/api/subscription/status` endpoint
4. Update payment verification logic in Cashfree/Paytm routes

### Phase 2: Frontend Structure
1. Update AuthContext with subscription checks
2. Enhance ProtectedRoute logic
3. Create SubscriptionGuard component
4. Create TrialBadge component
5. Create TrialExpiryWarning component

### Phase 3: Navigation Updates
1. Modify SelectRolePage to set trial for owners
2. Update SelectPlanPage to show promo info
3. Add subscription status checks to OwnerDashboard header
4. Update all protected routes to use new logic

### Phase 4: Payment Flow
1. Integrate Cashfree payment (₹40,000)
2. Add promo bonus logic (+5 months within 7 days)
3. Update payment callback to set active subscription
4. Add payment history tracking

### Phase 5: Reminders & Notifications
1. Implement trial expiry warnings (< 24 hours)
2. Add cron job for expiration reminders (optional backend)
3. Add mobile push notifications (Capacitor)
4. Add in-app toast notifications

---

## Critical Implementation Details

### 1. **Logout/Login Persistence** ⚠️ IMPORTANT
```javascript
// In AuthContext - verifySession function
const verifySession = async () => {
  const res = await api.get('/api/auth/me');
  const userData = res.data;
  
  // CRITICAL CHECK
  const now = new Date();
  const trialEnd = new Date(userData.trial_end_date);
  
  if (userData.subscription_status === 'trial' && trialEnd <= now) {
    // Trial expired - update status
    userData.subscription_status = 'expired';
  }
  
  // Save to cache and state
  localStorage.setItem('cached_user', JSON.stringify(userData));
  setUser(userData);
};
```

### 2. **Mobile-Specific Considerations** (Capacitor)
- Push notifications for trial expiry (using Capacitor Push Notifications plugin)
- Handle deep links to payment page from notifications
- Persist offline: Trial status doesn't change without server sync
- APP_STARTUP: Always verify subscription status on app launch

### 3. **Payment Gateway Integration**
- **Cashfree**: Primary gateway (already integrated)
  - Create order for ₹40,000
  - Verify payment status before updating subscription
  - Handle webhooks for reliability

- **Paytm**: Fallback (existing integration)
  - Similar flow to Cashfree

### 4. **Security Considerations**
- Trial can only be set once (at registration, not manually)
- `trial_end_date` is source of truth, never trust client-side calculations
- Subscription_status must be verified from server on every login
- Payment verification must hit payment gateway, not just client

---

## Testing Checklist

- [ ] New owner registration → 2-day trial → Dashboard (no SelectPlanPage)
- [ ] Trial countdown shows correctly in header
- [ ] Trial expiration warning at < 24 hours
- [ ] Logout during trial → Login → Still shows trial
- [ ] Logout after trial expires → Login → Redirects to SelectPlanPage
- [ ] Pay within 7 days → Get +5 months bonus
- [ ] Pay after 7 days → Get 1 year only
- [ ] After payment → Logout/Login → Goes to Dashboard (no SelectPlanPage)
- [ ] Mobile app (Capacitor) follows same logic
- [ ] Push notification on trial expiry (mobile)
- [ ] Payment gateway verification works
- [ ] Trial extension endpoint works (dev mode)

---

## Success Metrics

✅ New owners don't see SelectPlanPage on registration
✅ 100% of paid subscriptions persist across logout/login cycles
✅ Trial expiry converts 80%+ to paid subscriptions
✅ Promo bonus (7-day window) drives early payment conversions
✅ Mobile and web apps have identical behavior
✅ Zero database inconsistencies in subscription status

---

## File Changes Summary

### Frontend
- [ ] `frontend/src/context/AuthContext.jsx` - Add subscription checks
- [ ] `frontend/src/App.jsx` - Update ProtectedRoute logic
- [ ] `frontend/src/pages/SelectRolePage.jsx` - Skip SelectPlanPage for owners
- [ ] `frontend/src/pages/SelectPlanPage.jsx` - Enhance promo display
- [ ] `frontend/src/components/SubscriptionGuard.jsx` - NEW
- [ ] `frontend/src/components/TrialBadge.jsx` - NEW
- [ ] `frontend/src/components/TrialExpiryWarning.jsx` - NEW
- [ ] `frontend/src/pages/owner/OwnerDashboard.jsx` - Add TrialBadge

### Backend
- [ ] `backend/routes/auth.js` - Enhance /update-role endpoint
- [ ] `backend/routes/subscription.js` - Create new endpoints
- [ ] `backend/routes/cashfree.js` - Update payment verification
- [ ] `backend/routes/paytm.js` - Update payment verification

---

## Notes

- **Trial Period**: Exactly 2 days (48 hours) from registration timestamp
- **Subscription Duration**: 1 year (365 days) from successful payment
- **Promo Window**: 7 days from user registration (not from payment)
- **Promo Bonus**: 5 additional months (150 days) only if paid within 7 days
- **Plan Price**: ₹40,000 per year
- **Payment Gateways**: Cashfree (primary), Paytm (fallback)
- **Capacitor**: Same logic as web, with mobile-specific optimizations
