// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // TODO: point this at your real backend once it exists. Everything under
  // UserService/AuthInterceptor is scaffolded against this base URL - there
  // is no live API behind it yet.
  apiBaseUrl: 'https://api.example.com',
  // Scope(s) requested for calls to the backend above. Also used by
  // home.page.ts's initial signIn() call, so the user consents to these
  // during sign-in rather than hitting a second consent prompt the first
  // time AuthInterceptor acquires a token for them.
  apiScopes: [
    'api://<your-api-client-id>/read',
    'api://<your-api-client-id>/write',
  ] as string[],
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
