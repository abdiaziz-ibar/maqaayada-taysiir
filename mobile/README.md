# Maqaayda Taysiir — Mobile (Expo / React Native)

Same backend as the web app (`https://maqaayda.idraakict.com/api`) — no separate mobile API. Mirrors the web app's dual login (System Users / Parents) and the same JWT auth pattern, just with tokens in `AsyncStorage` instead of `localStorage`.

## What's built

- **Login**: System Users (username/password) and Parents (phone/password, first-time register) — same tabs as the web login.
- **Staff app** (bottom tabs): Dashboard, Cuntada Maalinlaha (daily attendance — the big ATE/DID NOT EAT buttons, mobile-first per the school's own spec), Cunto Mar-mar ah (occasional meals, search-first), Lacagaha (payments list + record new against a parent's open invoices), Dheeri (More menu → Ardayda, Waalidiinta, Invoices, Kharashaadka, Xisaab-xirka).
- **Parent app**: children + balances + invoices, per-child meal history, payment history, change password.

Deliberately **not** ported to mobile yet (still web-only — these are low-frequency admin/config tasks, better suited to a bigger screen): Classes, Meal Plans, Food/Menu management, Holidays/Fee Adjustments, Users, Settings, Audit Logs, School Calendar, monthly/annual reports beyond profit-loss. Ask if you want any of these added.

## Running it locally (Expo Go — fastest way to try it)

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (App Store / Play Store) on your phone. It talks directly to the live production API — use test data, not real families, while trying things out.

## Building the actual `.apk`

This sandbox has no Android SDK/Java, so the APK can't be built here — but **EAS Build** (Expo's free cloud build service) does it for you with two commands, no Android Studio needed:

```bash
cd mobile
npm install -g eas-cli
eas login          # creates a free Expo account on first run if you don't have one
eas build -p android --profile preview
```

That uploads the project and builds an installable `.apk` in the cloud (~10–15 minutes); it gives you a download link (and a QR code) when done. `eas.json` is already set up with a `preview` profile (`buildType: apk`, for direct install/sideloading) and a `production` profile (`app-bundle`, for a future Play Store submission).

## Notes

- `app.json`'s `android.package` is `com.taysiirschools.canteen` — change it before a real Play Store submission if you want a different app ID.
- No custom app icon/splash image is set yet (Expo's default placeholder is used) — drop `icon.png` / `splash.png` into `assets/` and reference them in `app.json` when you have real artwork.
