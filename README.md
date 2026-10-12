# capacitor-msal-entra-demo

An Ionic 9 / Angular 22 / Capacitor 8 demo app for
[`@nativelement/capacitor-msal-entra`](https://www.npmjs.com/package/@nativelement/capacitor-msal-entra),
a Capacitor plugin for signing in with **Microsoft Entra External ID (CIAM)** on web, iOS and Android.

## What the demo shows

| Plugin API | Where | What it does |
|---|---|---|
| `MsalAuth.getAccount()` | [home.page.ts](src/app/home/home.page.ts) `ngOnInit` | Restores a cached account on launch. On web this is also how a finished redirect sign-in surfaces. Returns `{ value: AccountInfo \| null }`. |
| `MsalAuth.signIn({ scopes })` | [home.page.ts](src/app/home/home.page.ts) `signIn()` | Interactive sign-in / sign-up through Entra's hosted page. Requests the API scopes up front so the user consents once. |
| `MsalAuth.acquireTokenSilent({ scopes })` | [auth.interceptor.ts](src/app/core/services/auth.interceptor.ts) | Gets a fresh access token for each API call. Falls back to interactive `signIn()` only on `UI_REQUIRED`. |
| `MsalAuth.signOut()` | [home.page.ts](src/app/home/home.page.ts) `signOut()` | Clears the account and cached tokens. |

The UI is a single sign-in screen: one **Sign-In or Create an Account** button, which swaps to the signed-in
account's username and a **Sign out** button once authenticated. Google/Apple sign-in needs no extra button;
add those providers to the user flow and Entra's hosted page shows them.

### Scaffolded (not wired to a backend)

These exist to show where an app-side user profile would plug in. There is no live API behind them.

- **`AuthInterceptor`** ([auth.interceptor.ts](src/app/core/services/auth.interceptor.ts)) attaches
  `Authorization: Bearer <token>` to requests whose URL starts with `environment.apiBaseUrl`, and never to
  other hosts. It is registered in `AppModule`.
- **`UserService`** ([user.service.ts](src/app/core/services/user.service.ts)) is a CRUD client for
  `/users` against `environment.apiBaseUrl`. Every call fails until you point that at a real API.
- **`OnboardingPage`** (`/onboarding`) is a "finish creating your account" form, reachable by URL only.
  It is deliberately not triggered after sign-in, because deciding whether a user is new needs a backend
  lookup or a tenant-side custom claim. The TODOs in `home.page.ts` and `onboarding.page.ts` list the options.

## Project layout

```
src/app/
  home/                 sign-in / sign-out screen (route: /home)
  onboarding/           placeholder new-user profile form (route: /onboarding)
  core/services/        AuthInterceptor, UserService
  core/models/          UserProfile types
src/environments/       apiBaseUrl and apiScopes
src/assets/             msal_config(.example).json for web
native-config/          example msal_config.json for Android and iOS
android/  ios/          Capacitor native projects
```

## Prerequisites

- Node 20+ and npm
- An Entra **External ID (CIAM) tenant** with a *Sign up and sign in* user flow
- An app registration in that tenant (see below)
- Xcode 15+ and CocoaPods for iOS; Android Studio for Android

## 1. Register the app in Entra

In the External ID tenant, create one app registration and add **three** platform entries:

| Platform | Redirect URI | Used by |
|---|---|---|
| Single-page application | `http://localhost:4200` | web / `ng serve` |
| iOS / macOS | bundle id `io.nativelement.demostarter` | iOS |
| Android | package name `io.nativelement.demostarter` + signature hash | Android |

> Use **Single-page application** for web, not "Web". The "Web" platform does not allow the CORS-enabled
> token endpoint call msal-browser makes with PKCE.

Associate the app with your user flow (**External Identities → User flows → your flow → Applications**).

To use your own identifiers, change `appId` in `capacitor.config.ts`, `applicationId` in
`android/app/build.gradle`, `PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project and the `msauth.*` scheme in
`ios/App/App/Info.plist`.

## 2. Configure and run on the web

```bash
npm install
cp src/assets/msal_config.example.json src/assets/msal_config.json
# edit client_id and authority_url
npm start          # http://localhost:4200
```

`src/assets/msal_config.json` is git-ignored so your tenant details stay local.

Also set `apiBaseUrl` and `apiScopes` in `src/environments/environment*.ts`. `apiScopes` are requested at
sign-in and used by `AuthInterceptor`; `apiBaseUrl` defaults to a placeholder with no backend behind it.

On web, `signIn()` performs a full-page redirect, so the returned promise never resolves. The result arrives
when the app reloads and `HomePage.ngOnInit` calls `getAccount()`.

## 3. Native platforms

The `android/` and `ios/` projects are committed. Sync after building the web assets:

```bash
npm run build
npx cap sync
```

### Android

1. Copy `native-config/android/msal_config.example.json` to
   `android/app/src/main/res/raw/msal_config.json` (git-ignored) and fill it in. `redirect_uri` needs the
   signature hash **URL-encoded** (`+`→`%2B`, `/`→`%2F`, `=`→`%3D`).
2. In `android/app/src/main/AndroidManifest.xml`, replace `YOUR_SIGNATURE_HASH` in `android:path` with the
   **raw, un-encoded** hash (keeping the leading `/`).
3. `npx cap run android`

Get the hash of your debug keystore with:

```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android \
  | openssl sha1 -binary | openssl base64
```

### iOS

1. The plugin ships a podspec, so the iOS project uses **CocoaPods**, not Swift Package Manager
   (`ios/App/CapApp-SPM.disabled` is intentionally unused).
2. Copy `native-config/ios/msal_config.example.json` to `ios/App/App/msal_config.json` (git-ignored) and
   fill it in. It is already referenced by the Xcode target.
3. Select your signing team in Xcode (Signing & Capabilities).
4. Keychain Sharing uses the `com.microsoft.adalcache` group (see `App.entitlements`).
5. `cd ios/App && pod install`, then `npx cap run ios`

## Known behaviours worth knowing

- `domainHint` works on iOS and web, **not Android** (yet). Use `'Google'` with a capital G; `'google'`
  fails with `AADSTS90023`.
- Do not pass `openid`, `profile` or `offline_access` in `scopes`.
- Debug and release keystores have different signature hashes on Android: register both.
- `getAccount()` returns `{ value: AccountInfo | null }`; unwrap `.value`.

## License

[MIT](LICENSE)
