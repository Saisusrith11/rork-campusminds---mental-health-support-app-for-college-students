# Development Configuration

## Local Development Setup

### 1. Manual Configuration Files

Since some configuration files are protected, you'll need to manually create/update these files:

#### package.json scripts section:
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

#### app.json updates:
- Change `bundleIdentifier` from `app.rork.campusminds-mental-health-support-app-for-college-students` to `com.campusminds.mentalhealth`
- Change `package` from `app.rork.campusminds-mental-health-support-app-for-college-students` to `com.campusminds.mentalhealth`
- Update expo-router plugin from object with origin to just `"expo-router"`
- Remove Rork-specific configurations

#### eas.json (create this file):
```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 2. Environment Setup

The project now includes:
- `constants/environment.ts` - Environment configuration
- Updated `services/api.ts` - Uses environment-based API URLs
- `LOCAL_SETUP_GUIDE.md` - Complete setup instructions

### 3. API Configuration

Update the API base URL in `constants/environment.ts`:
- Development: Points to localhost
- Production: Update with your production API URL

### 4. Running Locally

After making the manual configuration changes:

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios  
npm run web
```

### 5. Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Initialize EAS (after creating eas.json)
eas init

# Build for platforms
eas build --platform android
eas build --platform ios
```

This setup removes all Rork dependencies and allows you to develop, test, and build your app completely independently.