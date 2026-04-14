# Implementation Plan: Dark & Light Mode Support

Add a comprehensive theme management system to the web application, allowing users to toggle between Light and Dark modes. The preference will be saved in the browser's local storage.

## User Review Required

> [!NOTE]
> **Theme Scope**
> The dark mode will primary affect the Dashboard regions (for both Owners and Tenants). Authentication pages and the Landing page already have specific dark/glass styles that will be preserved.

## Proposed Changes

### [Frontend] - Theme Engine
#### [MODIFY] [index.css](file:///c:/Users/dasar/OneDrive/Desktop/AntiGravityHMS/frontend/src/index.css)
- Define a `.dark-mode` class that overrides the CSS variables in `:root`.
- Update standard colors to be more reactive to variable changes.

#### [NEW] [ThemeContext.jsx](file:///c:/Users/dasar/OneDrive/Desktop/AntiGravityHMS/frontend/src/context/ThemeContext.jsx)
- Create a `ThemeContext` and `ThemeProvider`.
- Synchronize the `theme` state ('light' or 'dark') with `localStorage`.
- Toggle the CSS class on the `document.body`.

#### [NEW] [ThemeToggle.jsx](file:///c:/Users/dasar/OneDrive/Desktop/AntiGravityHMS/frontend/src/components/ThemeToggle.jsx)
- A reusable button with smooth sun/moon icon transitions.

### [Frontend] - Integration
#### [MODIFY] [App.jsx](file:///c:/Users/dasar/OneDrive/Desktop/AntiGravityHMS/frontend/src/App.jsx)
- Wrap the entire application tree in the new `ThemeProvider`.

#### [MODIFY] [OwnerHeader.jsx](file:///c:/Users/dasar/OneDrive/Desktop/AntiGravityHMS/frontend/src/components/owner/OwnerHeader.jsx)
- Inject the `ThemeToggle` into the header actions area.

#### [MODIFY] [TenantDashboard.jsx](file:///c:/Users/dasar/OneDrive/Desktop/AntiGravityHMS/frontend/src/pages/tenant/TenantDashboard.jsx)
- Inject the `ThemeToggle` into the tenant dashboard header.

## Verification Plan

### Manual Verification
- **Toggle Test**: Click the Sun/Moon icons in both Owner and Tenant dashboards.
- **Persistence Test**: Switch to Dark mode, refresh the page, and ensure it stays in Dark mode.
- **Readability Test**: Check contrast in various cards and tables in dark mode.
