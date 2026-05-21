import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Performance: Pre-warm the backend immediately to reduce cold-start delay
(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://pg-backend-499c.onrender.com';
    fetch(`${apiUrl}/api/auth/me`).catch(() => {});
  } catch (e) {}
})();

// Initialize Capacitor native plugins (no-op on web)
(async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      // Hide native splash screen once React is ready
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide({ fadeOutDuration: 300 });

      // Style the status bar
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#060810' });
    }
  } catch (e) {
    // Not a native platform or plugins not available — safe to ignore
  }
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
