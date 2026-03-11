# 🌍 UpsideDown

> *What's on the other side of the Earth from where you stand?*

UpsideDown is a fun cross-platform mobile app (iOS & Android) built with **React Native (Expo)** and **TypeScript**. Grant access to your GPS location and the app instantly shows you your **antipodal point** — the exact location you'd reach if you dug a hole straight through the Earth!

---

## 📱 Screenshots

| Welcome Screen | Map View | Community Pins |
|---|---|---|
| *(coming soon)* | *(coming soon)* | *(coming soon)* |

---

## ✨ Features

- **📍 Location Access** — Requests precise GPS coordinates
- **🔄 Antipodal Calculation** — Instantly calculates the point on the exact opposite side of Earth
- **🗺️ Interactive Map** — `react-native-maps` powered map showing both your location and antipodal point with a visual connection
- **👥 Community Pins** — See pins dropped by other users around the world (powered by Firebase Firestore)
- **🔐 Anonymous Auth** — No sign-up required; each user gets a unique anonymous Firebase identity
- **🎨 Earth-themed UI** — Deep blue/green colour scheme with a globe animation

---

## 🧮 How the Antipodal Calculation Works

The antipodal point is the exact opposite location on Earth's surface. The maths is surprisingly simple:

```
antipodal_latitude  = -1 × latitude
antipodal_longitude = longitude + 180   (subtract 360 if result > 180)
```

**Example:** New York City is at `40.7128° N, 74.0060° W`  
Its antipodal point is at `40.7128° S, 106.0° E` — somewhere in the Indian Ocean! 🌊

> 💡 **Fun fact:** Only ~4% of land on Earth has land on the opposite side. Most antipodal points are in the ocean!

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- Expo Go app on your phone (optional, for device testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/bhavyat81/UpsideDown.git
cd UpsideDown

# Install dependencies
npm install

# Start the Expo development server
expo start
```

Scan the QR code with **Expo Go** (Android) or your **Camera app** (iOS), or press `i` for iOS simulator / `a` for Android emulator.

---

## 🔥 Firebase Setup

UpsideDown uses Firebase Firestore for community pins and Firebase Anonymous Auth.

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project
2. Add a **Web app** to your project
3. Enable **Anonymous Authentication** under *Authentication → Sign-in method*
4. Create a **Firestore Database** (start in test mode for development)
5. Copy your Firebase config object and replace the placeholder values in `firebaseConfig.ts`:

```typescript
// firebaseConfig.ts
export const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-sender-id',
  appId: 'your-app-id',
};
```

> ⚠️ **Never commit real API keys to a public repo!** Use environment variables or `.env` files (already in `.gitignore`) for production.

### Firestore Security Rules (recommended for production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pins/{pin} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;
      allow update, delete: if false;
    }
  }
}
```

---

## 📁 Project Structure

```
UpsideDown/
├── App.tsx                         # Entry point
├── app.json                        # Expo configuration
├── package.json
├── tsconfig.json
├── babel.config.js
├── firebaseConfig.ts               # Firebase config (replace with your own!)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Main map screen
│   │   ├── CommunityScreen.tsx     # Browse community pins
│   │   └── AboutScreen.tsx         # App info & fun facts
│   ├── components/
│   │   ├── MapView.tsx             # Map with markers & connection line
│   │   ├── AntipodalCard.tsx       # Info card with location details
│   │   ├── PinMarker.tsx           # Custom map pin markers
│   │   └── GlobeAnimation.tsx      # Animated globe illustration
│   ├── services/
│   │   ├── location.ts             # GPS permission & fetching + reverse geocoding
│   │   ├── antipodal.ts            # Antipodal calculation logic
│   │   └── firebase.ts             # Firestore & Auth operations
│   ├── utils/
│   │   ├── constants.ts            # Colours, collection names, map defaults
│   │   └── helpers.ts              # Coordinate formatting, name generation
│   ├── types/
│   │   └── index.ts                # Shared TypeScript types
│   └── navigation/
│       └── AppNavigator.tsx        # Bottom-tab navigation
└── assets/
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React Native + Expo | Cross-platform mobile framework |
| TypeScript | Type safety |
| react-native-maps | Interactive map rendering |
| expo-location | GPS access & reverse geocoding |
| Firebase Firestore | Real-time community pin database |
| Firebase Anonymous Auth | Frictionless user identity |
| React Navigation | Screen navigation |
| Expo Vector Icons | Icons throughout the UI |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-cool-feature`
3. Commit your changes: `git commit -m 'Add my cool feature'`
4. Push to the branch: `git push origin feature/my-cool-feature`
5. Open a Pull Request

Please make sure your code passes TypeScript checks before submitting a PR.

---

## 📄 License

MIT — feel free to use this for your own projects!

---

Made with ❤️ for curious explorers 🌍