# 🥗 Veggies Kitchen — Android App

Production-grade Android app for **Veggies Kitchen**, a North-Indian vegetarian food delivery service. Built with React + Vite wrapped in **Capacitor 8**, targeting Play Store distribution.

---

## 📱 App Features

| Feature | Details |
|---------|---------|
| **Auth** | Phone OTP (Firebase), Email/Password, Google OAuth (web) |
| **Cart** | Persistent via `@capacitor/preferences`, syncs across sessions |
| **Search** | Live fuzzy search with recents, veg filter |
| **Order Tracking** | Real-time status timeline, polls every 30s |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Location** | Capacitor Geolocation + BigDataCloud reverse geocoding |
| **Camera** | Profile photo upload via `@capacitor/camera` |
| **Payments** | Razorpay (online) + Cash on Delivery |
| **Deep Links** | `veggieskitchen://` scheme for notification taps |
| **Onboarding** | 3-slide first-launch carousel |
| **Back Button** | Android hardware back button handled (minimize on home) |
| **Safe Areas** | Notch + nav-bar padding via `env(safe-area-inset-*)` |
| **Haptics** | Context-sensitive vibration throughout |
| **Account Deletion** | Play Store DDA compliance |

---

## 🗂️ Project Structure

```
Veggies Kitchen/
├── src/                          # React frontend
│   ├── hooks/
│   │   └── useCapacitor.js       # Platform detection (isNative, isAndroid)
│   ├── services/
│   │   ├── storage.js            # Secure storage (@capacitor/preferences)
│   │   ├── haptics.js            # Haptic feedback
│   │   ├── geolocation.js        # GPS + reverse geocoding
│   │   ├── notifications.js      # FCM push setup
│   │   └── deepLinking.js        # Deep link router
│   ├── AuthContext.jsx           # JWT (mobile) + session (web) auth
│   ├── CartContext.jsx           # Cart with Capacitor Preferences
│   ├── OnboardingCarousel.jsx    # First-launch slides
│   ├── OTPLoginPage.jsx          # Phone OTP + email/password login
│   ├── SearchPage.jsx            # Live search with filters
│   ├── OrderTrackingPage.jsx     # Status timeline
│   ├── AccountPage.jsx           # Profile, camera, delete account
│   ├── SplashHandler.jsx         # Capacitor splash screen management
│   ├── mobile.css                # Safe-area, native-feel styles
│   └── config.js                 # Smart API base URL
├── server/                       # Node.js backend
│   ├── middleware/
│   │   └── auth.js               # Unified JWT + session auth
│   ├── services/
│   │   ├── razorpay.js           # Payment order creation + verification
│   │   └── pushNotifications.js  # Firebase Admin FCM
│   ├── models/
│   │   ├── User.js               # Extended: fcmTokens, refreshTokens, phone
│   │   └── Order.js              # Extended: payment fields, statusHistory
│   └── routes/api.js             # All API endpoints
├── android/                      # Capacitor Android project
│   └── app/src/main/
│       ├── AndroidManifest.xml   # All permissions, deep links, FCM
│       └── res/xml/
│           ├── file_paths.xml    # Camera FileProvider
│           └── network_security_config.xml
└── capacitor.config.ts           # Capacitor production config
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **JDK 17+** (set `JAVA_HOME`)
- **Android Studio** (for emulator / USB debugging)
- **Android SDK** with Build Tools 36+ (set `ANDROID_HOME`)

### Install & Build

```bash
# Install all dependencies
npm install
cd server && npm install && cd ..

# Build the web app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio (then build & run)
npx cap open android
```

### Run on Device / Emulator

```bash
# USB debugging (device must be connected + USB debugging enabled)
npx cap run android

# Or open Android Studio and click ▶ Run
npx cap open android
```

---

## 🔑 Environment Setup

### Frontend — `.env`
```env
VITE_API_URL=https://veggie-7vvt.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX

# Firebase (from Firebase Console → Project Settings → Web App)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Backend — `server/.env`
```env
MONGODB_URI=mongodb+srv://user:password@cluster0.nnm6dcw.mongodb.net/
SESSION_SECRET=your-random-session-secret-here
JWT_SECRET=your-random-jwt-secret-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-vercel-url.vercel.app

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://veggie-7vvt.onrender.com/auth/google/callback

RESEND_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Firebase Admin (from Firebase Console → Project Settings → Service Accounts → Generate Key)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=
```

---

## 🔥 Firebase Setup (Required for OTP + Push Notifications)

1. Go to [Firebase Console](https://console.firebase.google.com) → Create/select project
2. **Enable Phone Authentication**: Authentication → Sign-in method → Phone → Enable
3. **Enable Cloud Messaging**: Project Settings → Cloud Messaging
4. **Add Android App**: 
   - Package name: `com.veggieskitchen.app`
   - Download `google-services.json` → place in `android/app/google-services.json`
5. **Web App config**: Project Settings → General → Your apps → Web app → copy config to `.env`
6. **Service Account key**: Project Settings → Service Accounts → Generate new private key → add values to `server/.env`

---

## 💳 Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Dashboard → API Keys → Generate Test Key
3. Add `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` to `server/.env`
4. Add `VITE_RAZORPAY_KEY_ID` to frontend `.env`
5. For production: complete KYC and switch to Live keys

---

## 🏗️ Play Store Build

### 1. Generate a keystore
```bash
keytool -genkey -v -keystore veggies-kitchen.keystore \
  -alias veggies-kitchen -keyalg RSA -keysize 2048 -validity 10000
```
Store the keystore securely. **Never commit it to git.**

### 2. Configure signing in `android/app/build.gradle`
```groovy
android {
    signingConfigs {
        release {
            storeFile file('../../veggies-kitchen.keystore')
            storePassword System.getenv('KEYSTORE_PASSWORD')
            keyAlias 'veggies-kitchen'
            keyPassword System.getenv('KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

### 3. Build release APK / AAB
```bash
# In Android Studio: Build → Generate Signed Bundle / APK
# Or via CLI:
cd android
./gradlew bundleRelease    # .aab for Play Store
./gradlew assembleRelease  # .apk for direct install
```

Release AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔧 Development Workflow

```bash
# Watch for changes and auto-sync (web only — reload in browser)
npm run dev

# After any React code change, rebuild + sync to test on device:
npm run build && npx cap sync android

# Available npm scripts:
npm run build          # Vite production build
npm run android        # Build + open Android Studio
npm run android:sync   # cap sync android
npm run android:run    # cap run android (USB device)
npm run cap:sync       # npx cap sync
npm run cap:copy       # npx cap copy (faster, no plugin update)
```

---

## 🌐 API Endpoints Reference

### Auth (Mobile JWT)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Email+password registration |
| POST | `/api/auth/login` | Email+password login |
| POST | `/api/auth/verify-otp` | Firebase Phone token → JWT |
| POST | `/api/auth/refresh` | Refresh JWT |
| POST | `/api/auth/fcm-token` | Register FCM device token |
| DELETE | `/api/auth/fcm-token` | Remove FCM token on logout |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get full profile |
| PATCH | `/api/users/me` | Update name, phone, profilePhoto |
| POST | `/api/users/me/addresses` | Add delivery address |
| DELETE | `/api/users/me/addresses/:idx` | Remove address |
| DELETE | `/api/users/me` | Soft-delete account (Play Store DDA) |

### Payments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| POST | `/api/payments/webhook` | Razorpay webhook handler |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders/me` | Current user's orders |
| GET | `/api/orders/:id` | Single order detail |
| POST | `/api/orders/:id/reorder` | Clone past order items |

---

## 🔒 Security Notes

- JWT tokens stored in `@capacitor/preferences` (native) — NOT `localStorage`
- Session cookies used only on web (cross-domain safe for Capacitor)
- `GET /api/orders` and `GET /api/activity` now require admin auth (was previously public)
- Helmet.js added to backend for HTTP security headers
- Rate limiting: 10 requests / 15 minutes on auth endpoints
- Network security config enforces HTTPS in production (cleartext only for localhost)

---

## 📋 Checklist Before Play Store Submission

- [ ] Replace test Razorpay keys with live keys
- [ ] Download and place `google-services.json` in `android/app/`
- [ ] Set all environment variables on Render (backend)
- [ ] Set all `VITE_*` variables on Vercel (frontend)
- [ ] Generate production keystore and sign the AAB
- [ ] Update MongoDB Atlas password and whitelist Render IP
- [ ] Test on a physical Android device (min API 24)
- [ ] Fill Play Store listing: screenshots, description, privacy policy URL
- [ ] Privacy Policy URL: add to `android/app/src/main/AndroidManifest.xml` `<meta-data>`
- [ ] Set `targetSdkVersion` ≥ 35 in `android/variables.gradle` ✅ (already 36)
- [ ] Set `minSdkVersion` ≥ 24 ✅ (already 24)
- [ ] Test account deletion flow (DDA compliance) ✅

---

*Built with ❤️ using React 19, Vite 8, Capacitor 8, Node.js + MongoDB*
