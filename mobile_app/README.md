# EasyPG Flutter Mobile App

This is the professional mobile app for the **EasyPG Hostel Management SaaS**, built with Flutter.

## 🚀 How to Run Locally

1. **Prerequisites**: Ensure you have the [Flutter SDK](https://docs.flutter.dev/get-started/install) installed on your machine.
2. **Move Files**: Copy the `mobile_app` folder to your local development machine.
3. **Install Dependencies**:
   ```bash
   cd mobile_app
   flutter pub get
   ```
4. **Configuration**:
   - The app is currently configured to connect to your backend at: `https://pg-backend-499c.onrender.com`.
   - To change this, edit the `baseUrl` inside `lib/services/api_service.dart`.
5. **Run the App**:
   ```bash
   flutter run
   ```

## 📱 Features Implemented
- **Galaxy Glass UI**: Replicated the premium dark-mode aesthetic with backdrop blur and gradients.
- **Tenant Dashboard**: Real-time view of daily food menu, notices, and hostel guidelines.
- **Owner Dashboard**: High-level business metrics and payment tracking.
- **Universal Login**: Role-based redirection for tenants and owners.
- **Push Notification Support**: Pre-integrated logic for Firebase Cloud Messaging (FCM).

## 📁 Key Files
- `lib/providers/auth_provider.dart`: Session & Auth management.
- `lib/services/api_service.dart`: Handles all communication with your Render backend.
- `lib/screens/`: Contains the UI for Login and Dashboards.
