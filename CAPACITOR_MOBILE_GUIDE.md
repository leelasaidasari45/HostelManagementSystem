# Capacitor Mobile Implementation Guide - Payment Integration

## Overview
This guide covers mobile-specific implementation for the payment integration system in your Capacitor-based AntiGravityHMS mobile app.

---

## Part 1: Capacitor Setup & Configuration

### 1.1 Install Required Capacitor Plugins

```bash
# Local Notifications (for trial expiry alerts)
npm install @capacitor/local-notifications
npx cap sync

# App Events (for handling foreground/background)
npm install @capacitor/app
npx cap sync

# Optional: Push Notifications (for server-sent alerts)
npm install @capacitor/push-notifications
npx cap sync

# Optional: Share (for sharing payment receipt)
npm install @capacitor/share
npx cap sync
```

### 1.2 Update Capacitor Config

```json
// capacitor.config.json
{
  "appId": "com.easypg.hms",
  "appName": "easyPG HMS",
  "webDir": "dist",
  "plugins": {
    "LocalNotifications": {
      "smallIcon": "ic_stat_notification",
      "iconColor": "#7c3aed"
    },
    "PushNotifications": {
      "presentationOption": ["badge", "sound", "alert"]
    }
  }
}
```

### 1.3 Android Manifest Update

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
  <!-- Add notification permissions -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  
  <application>
    <!-- Add notification icons -->
    <meta-data
      android:name="com.google.firebase.messaging.default_notification_icon"
      android:resource="@drawable/ic_stat_notification" />
  </application>
</manifest>
```

---

## Part 2: Mobile-Specific Frontend Implementation

### 2.1 Create Mobile Auth Sync Service

Create a new file: `frontend/src/services/mobileAuthSync.ts`

```typescript
import { App } from '@capacitor/app';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export const initializeMobileAuthSync = (authContext) => {
  // Verify subscription status when app comes to foreground
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      verifySubscriptionStatusMobile(authContext);
    }
  });

  // Verify on app startup
  verifySubscriptionStatusMobile(authContext);
};

const verifySubscriptionStatusMobile = async (authContext) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const res = await api.get('/api/auth/me');
    const userData = res.data;

    // Check if trial/subscription expired
    const now = new Date();
    const trialEnd = userData.trial_end_date ? new Date(userData.trial_end_date) : null;

    if (userData.subscription_status === 'trial' && trialEnd && now > trialEnd) {
      // Trial expired - update context
      userData.subscription_status = 'expired';
    }

    // Update context with fresh data
    authContext.loginContext(userData);
  } catch (err) {
    console.error('Mobile subscription sync failed:', err);
  }
};

export default initializeMobileAuthSync;
```

### 2.2 Create Mobile Notification Service

Create a new file: `frontend/src/services/mobileNotifications.ts`

```typescript
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

export interface TrialNotification {
  trialEndDate: string;
  hoursLeft: number;
  ownerName: string;
}

/**
 * Schedule local notification for trial expiry
 * Called when trial has < 24 hours remaining
 */
export const scheduleTrialExpiryNotification = async (
  trialEndDate: string,
  ownerName: string
) => {
  try {
    const hoursLeft = Math.floor(
      (new Date(trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60)
    );

    if (hoursLeft <= 0) return; // Already expired

    // Schedule notification at strategic times
    const notifications = [];

    if (hoursLeft > 6) {
      // Schedule for 6 hours before expiry
      notifications.push({
        id: 1001,
        title: '⏰ easyPG Trial Expiring Soon',
        body: `${hoursLeft}h left to upgrade and continue managing ${ownerName}`,
        largeBody: `Your easyPG trial expires in ${hoursLeft} hours. Tap to upgrade and get +5 months free if you pay within 7 days of registration.`,
        schedule: { at: new Date(new Date(trialEndDate).getTime() - 6 * 60 * 60 * 1000) },
        actionTypeId: 'TRIAL_EXPIRY',
        smallIcon: 'ic_stat_notification',
      });
    }

    if (hoursLeft > 1) {
      // Schedule for 1 hour before expiry
      notifications.push({
        id: 1002,
        title: '⚠️ easyPG Trial Expires in 1 Hour!',
        body: 'Upgrade now to keep using easyPG. Last chance for +5 months free!',
        largeBody: 'Your trial ends in 1 hour. Upgrade now and get +5 additional months if paid within 7 days of registration.',
        schedule: { at: new Date(new Date(trialEndDate).getTime() - 1 * 60 * 60 * 1000) },
        actionTypeId: 'TRIAL_URGENT',
        smallIcon: 'ic_stat_notification',
      });
    }

    if (hoursLeft <= 0.5) {
      // Immediate notification if already < 30 mins
      notifications.push({
        id: 1003,
        title: '🚨 easyPG Trial Expires NOW!',
        body: 'Upgrade immediately to continue access',
        schedule: { at: new Date() },
        actionTypeId: 'TRIAL_CRITICAL',
        smallIcon: 'ic_stat_notification',
      });
    }

    // Schedule all notifications
    for (const notif of notifications) {
      await LocalNotifications.schedule({ notifications: [notif] });
    }
  } catch (err) {
    console.error('Failed to schedule trial notification:', err);
  }
};

/**
 * Listen for notification taps and handle deep linking
 */
export const setupNotificationHandlers = (navigationCallback) => {
  LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
    const actionId = event.actionId;

    if (
      actionId === 'TRIAL_EXPIRY' ||
      actionId === 'TRIAL_URGENT' ||
      actionId === 'TRIAL_CRITICAL'
    ) {
      navigationCallback('/select-plan');
    }
  });
};

/**
 * Clear all trial notifications
 */
export const clearTrialNotifications = async () => {
  try {
    await LocalNotifications.cancel({ notifications: [
      { id: 1001 },
      { id: 1002 },
      { id: 1003 },
    ] });
  } catch (err) {
    console.error('Failed to clear notifications:', err);
  }
};
```

### 2.3 Update Main App Entry Point

Update `frontend/src/main.jsx`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core';
import initializeMobileAuthSync from './services/mobileAuthSync';

// Initialize Capacitor-specific features if running on mobile
const isNative = Capacitor.isNativePlatform();

if (isNative) {
  // Handle app startup on mobile
  import('./services/mobileNotifications').then(({ setupNotificationHandlers }) => {
    setupNotificationHandlers((route) => {
      // This will be called when user taps a notification
      window.location.hash = route; // Simple routing for now
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2.4 Update AuthContext for Mobile

Update `frontend/src/context/AuthContext.jsx` to call mobile sync:

```javascript
// In AuthProvider component, after the main useEffect:

useEffect(() => {
  // Initialize mobile-specific sync
  if (Capacitor.isNativePlatform()) {
    import('../services/mobileAuthSync').then(({ default: initSync }) => {
      initSync({ verifySession });
    });
  }
}, [verifySession]);
```

### 2.5 Update SubscriptionGuard for Mobile

Modify `frontend/src/components/SubscriptionGuard.jsx`:

```javascript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';
import { scheduleTrialExpiryNotification, clearTrialNotifications } from '../services/mobileNotifications';

const SubscriptionGuard = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasCheckedExpiry, setHasCheckedExpiry] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!user || user.role !== 'owner') return;

    const checkSubscription = () => {
      const now = new Date();
      const trialEnd = user.trial_end_date ? new Date(user.trial_end_date) : null;

      // If trial has expired
      if (
        user.subscription_status === 'trial' &&
        trialEnd &&
        now > trialEnd
      ) {
        if (isNative) {
          clearTrialNotifications();
        }
        navigate('/select-plan', { replace: true });
        return;
      }

      // If subscription is still valid but < 24 hours left (mobile notification)
      if (user.subscription_status === 'trial' && trialEnd && isNative) {
        const hoursLeft = (trialEnd - now) / (1000 * 60 * 60);
        if (hoursLeft <= 24 && hoursLeft > 0) {
          scheduleTrialExpiryNotification(user.trial_end_date, user.name);
        }
      }

      // If invalid status
      if (
        user.subscription_status !== 'trial' &&
        user.subscription_status !== 'active'
      ) {
        if (window.location.pathname !== '/select-plan') {
          navigate('/select-plan', { replace: true });
        }
        return;
      }

      setHasCheckedExpiry(true);
    };

    checkSubscription();

    // Re-check every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, navigate, isNative]);

  if (user?.role === 'owner' && !hasCheckedExpiry) {
    return null;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
```

---

## Part 3: Payment Handling on Mobile

### 3.1 Mobile Payment Best Practices

```javascript
// frontend/src/pages/SelectPlanPage.jsx - Update payment handler

const handleAnnualProMobile = async () => {
  setLoadingAnnual(true);
  
  try {
    // Show loading indicator
    if (Capacitor.isNativePlatform()) {
      // On mobile, show a more prominent loading overlay
      document.body.style.overflow = 'hidden';
    }

    // Create order
    const res = await api.post('/api/cashfree/create-order', {
      amount: 40000,
      month: 'Annual',
      year: new Date().getFullYear(),
      type: 'subscription',
    });

    const { payment_session_id, order_id, environment } = res.data;

    // Load Cashfree SDK
    const CF_MODE = environment || 'production';
    const loadSDK = () => new Promise((resolve, reject) => {
      if (window.Cashfree) { 
        resolve(window.Cashfree); 
        return; 
      }
      const s = document.createElement('script');
      s.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      s.onload = () => resolve(window.Cashfree);
      s.onerror = () => reject(new Error('Failed to load Cashfree'));
      document.body.appendChild(s);
    });
    
    await loadSDK();
    const cashfree = await window.Cashfree({ mode: CF_MODE });

    // Launch payment modal
    const redirectTarget = Capacitor.isNativePlatform() ? '_modal' : '_modal';
    const result = await cashfree.checkout({
      paymentSessionId: payment_session_id,
      redirectTarget: redirectTarget,
    });

    const userCancelled = result?.error?.code === 'PAYMENT_CANCELLED_BY_USER';
    if (userCancelled) {
      toast('Payment cancelled.', { icon: 'ℹ️' });
      if (Capacitor.isNativePlatform()) {
        document.body.style.overflow = 'auto';
      }
      setLoadingAnnual(false);
      return;
    }

    // Verify payment
    toast.loading('Verifying payment...', { id: 'sub-verify' });
    const verifyRes = await api.post('/api/subscription/verify-cashfree', {
      order_id,
      amount: 40000,
      plan_name: 'Annual Pro',
    });

    toast.dismiss('sub-verify');
    
    if (verifyRes.data.success) {
      // Update context
      loginContext({ 
        ...user, 
        payment_setup_complete: true, 
        subscription_status: 'active',
        trial_end_date: verifyRes.data.end_date
      });

      // Clear notification
      if (Capacitor.isNativePlatform()) {
        const { clearTrialNotifications } = await import('../services/mobileNotifications');
        await clearTrialNotifications();
        document.body.style.overflow = 'auto';
      }

      toast.success('🎉 Annual Pro activated!');
      navigate('/owner/dashboard', { replace: true });
    }
  } catch (err) {
    if (Capacitor.isNativePlatform()) {
      document.body.style.overflow = 'auto';
    }
    toast.error(err.response?.data?.error || 'Payment failed');
  } finally {
    setLoadingAnnual(false);
  }
};
```

### 3.2 Handle Payment Deeplinks

```javascript
// frontend/src/App.jsx - Add deep link handling in AppContent

import { App as CapacitorApp } from '@capacitor/app';

function AppContent() {
  // ... existing code ...

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Handle deep links from payment redirects
    CapacitorApp.addListener('appUrlOpen', (data: any) => {
      const slug = data.url.split('.app').pop();
      
      if (slug?.includes('payment=success')) {
        const urlParams = new URLSearchParams(slug.split('?')[1]);
        const orderId = urlParams.get('order_id');
        
        // Verify payment automatically
        verifyPaymentFromDeepLink(orderId);
      } else if (slug?.includes('select-plan')) {
        window.location.hash = '/select-plan';
      }
    });
  }, []);

  // ... rest of code ...
}
```

---

## Part 4: Android/iOS Specific Considerations

### 4.1 Android - Permissions & Manifest

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
  <!-- Notification permissions (Android 13+) -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  
  <!-- Network permissions -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  
  <application>
    <!-- Allow HTTP for localhost testing -->
    <domain-config cleartextTrafficPermitted="false">
      <domain includeSubdomains="true">easypg.com</domain>
      <domain includeSubdomains="true">*.vercel.app</domain>
    </domain-config>
  </application>
</manifest>
```

### 4.2 iOS - Certificate Pinning (Optional)

For production, implement certificate pinning:

```swift
// ios/App/Podfile - Add after the main target block
post_install do |installer|
  installer.pods_project.targets.each do |target|
    flutter_additional_ios_build_settings(target)
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'CERTIFICATE_PINNING_ENABLED=1'
      ]
    end
  end
end
```

### 4.3 Build Commands

```bash
# Android
ionic cap build android --prod

# iOS
ionic cap build ios --prod

# Then build in Xcode/Android Studio as needed
```

---

## Part 5: Testing on Physical Devices

### 5.1 Test Setup

```bash
# Build and deploy to Android device
npm run build
npx cap copy
npx cap sync android
npx cap open android

# Then in Android Studio:
# 1. Connect device via USB
# 2. Enable Developer Mode on device
# 3. Click "Run" in Android Studio

# For iOS
npx cap open ios
# Then open in Xcode and build
```

### 5.2 Testing Checklist - Mobile

- [ ] **Startup**: App launches → Subscription status verified
- [ ] **Background**: App backgrounded for 5 mins → Returns to foreground → Status re-verified
- [ ] **Notifications**: Trial < 24h → Receive local notification
- [ ] **Notification Tap**: Tap notification → Routes to /select-plan
- [ ] **Payment Modal**: Payment initiated → Cashfree modal opens (not web browser)
- [ ] **Payment Success**: Complete payment → Returns to app → Subscription activated
- [ ] **Offline**: Go offline → Go to trial dashboard → Shows cached data
- [ ] **Offline → Online**: Go online → Status auto-syncs with server
- [ ] **Payment Deeplink**: Receive payment success deep link → Auto-verifies payment

---

## Part 6: Troubleshooting Mobile Issues

### Issue: Notifications not showing on Android
**Solution:**
1. Check AndroidManifest.xml has POST_NOTIFICATIONS permission
2. Verify notification channel is created in app settings
3. Check device notification settings for app
4. Ensure minSdkVersion >= 31 in build.gradle

### Issue: Cashfree payment modal not opening on mobile
**Solution:**
1. Use `redirectTarget: '_modal'` not `_blank`
2. Ensure HTTPS is enabled in Capacitor config
3. Check Cashfree domain is whitelisted in CSP headers
4. Test in mobile browser first before Capacitor

### Issue: User still sees dashboard after logout despite subscription expiring
**Solution:**
1. Force app refresh: Pull-to-refresh or restart app
2. Clear localStorage: `localStorage.clear()` in browser console
3. Check `isSubscriptionValid()` logic in AuthContext
4. Verify `trial_end_date` is correctly set in database

### Issue: Deep links not working after payment
**Solution:**
1. Configure App URL scheme in capacitor.config.json
2. Set return_url in Cashfree order creation
3. Test with `adb shell am start -W -a android.intent.action.VIEW -d "com.easypg.hms://payment=success?order_id=123"`

---

## Part 7: Deployment Checklist

Before deploying to App Store/Play Store:

- [ ] All components properly import Capacitor
- [ ] LocalNotifications scheduled and cleared correctly
- [ ] Payment flow tested on physical devices
- [ ] App handles network connectivity changes
- [ ] App handles app backgrounding/foregrounding
- [ ] Deep links configured in both Android & iOS
- [ ] Notifications have proper icons and colors
- [ ] AuthContext properly initializes on app startup
- [ ] Trial badge shows correctly on mobile UI
- [ ] SelectPlanPage payment button works on mobile
- [ ] Test accounts created for payment testing
- [ ] Analytics integrated (optional but recommended)
- [ ] Crash reporting configured (Firebase, Sentry, etc.)
- [ ] App signing certificates configured
- [ ] Privacy policy and terms updated for subscription

---

## Summary

You now have a complete mobile implementation for the payment system that:
✅ Verifies subscription status on app startup
✅ Schedules local notifications for trial expiry
✅ Handles payment in native modal
✅ Syncs payment status across app lifecycle
✅ Handles offline scenarios gracefully
✅ Maintains parity with web app behavior
