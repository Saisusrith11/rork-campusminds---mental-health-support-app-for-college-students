# Local Development Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For mobile development: Android Studio (Android) or Xcode (iOS)

## Setup Steps

### 1. Update package.json scripts
Replace the scripts section in your `package.json` with:
```json
"scripts": {
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web",
  "test": "jest --watchAll",
  "lint": "expo lint --fix"
}
```

### 2. Update app.json configuration
Update your `app.json` to remove Rork-specific configurations:

```json
{
  "expo": {
    "name": "CampusMinds - Mental Health Support App",
    "slug": "campusminds-mental-health",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "campusminds",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.campusminds.mentalhealth",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.campusminds.mentalhealth",
      "permissions": [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.SCHEDULE_EXACT_ALARM"
      ]
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default"
        }
      ],
      [
        "expo-secure-store",
        {
          "faceIDPermission": "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
        }
      ],
      "expo-document-picker"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 3. Install Dependencies
```bash
npm install
# or
yarn install
```

### 4. Running the App

#### Development Server
```bash
npm start
# or
yarn start
```

#### Web Development
```bash
npm run web
# or
yarn web
```

#### Android Development
```bash
npm run android
# or
yarn android
```

#### iOS Development
```bash
npm run ios
# or
yarn ios
```

### 5. Building for Production

#### Install EAS CLI
```bash
npm install -g eas-cli
```

#### Configure EAS
```bash
eas init
```

#### Build for Android
```bash
eas build --platform android
```

#### Build for iOS
```bash
eas build --platform ios
```

### 6. API Configuration
Update the API base URL in your services files to point to your local or production API server instead of Rork's endpoints.

In `services/api.ts`, update:
```typescript
const API_BASE_URL = 'http://localhost:3000/api'; // or your production API URL
```

### 7. Environment Variables
Create a `.env` file in your project root for environment-specific configurations:
```
API_BASE_URL=http://localhost:3000/api
ENVIRONMENT=development
```

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Android build issues**: Ensure Android SDK is properly configured
3. **iOS build issues**: Ensure Xcode is installed and configured
4. **Web compatibility**: Some native modules may not work on web

### Development Tips
- Use `expo doctor` to check for common configuration issues
- Use `expo install` instead of `npm install` for Expo-compatible packages
- Test on physical devices for better performance evaluation

This setup will allow you to develop, test, and build your app completely independently of Rork's infrastructure.