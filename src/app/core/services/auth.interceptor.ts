import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { MsalAuth } from '@nativelement/capacitor-msal-entra';
import { environment } from '../../../environments/environment';

/**
 * Attaches a fresh Entra access token to outgoing API requests.
 *
 * This mirrors the `getFreshToken()` pattern from the plugin README: try
 * silent renewal first, only fall back to an interactive `signIn()` when
 * MSAL says it genuinely can't renew silently (`UI_REQUIRED`). Registered
 * in AppModule via HTTP_INTERCEPTORS - see app.module.ts.
 *
 * There is no real backend behind `environment.apiBaseUrl` yet; this class
 * exists so the token-attachment plumbing is in place and testable the
 * moment one shows up. See UserService for the matching CRUD scaffold.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only attach the token to calls aimed at our own API - never forward it
    // to third-party hosts (e.g. CDNs, other APIs) a request might target.
    if (!req.url.startsWith(environment.apiBaseUrl)) {
      return next.handle(req);
    }

    return from(this.getFreshToken()).pipe(
      switchMap((accessToken) => {
        const authorized = req.clone({
          setHeaders: { Authorization: `Bearer ${accessToken}` },
        });
        return next.handle(authorized);
      }),
    );
  }

  // TODO: other extension points worth adding here as the app grows:
  // - Retry-once-on-401: if the backend still rejects a "fresh" token
  //   (e.g. clock skew, revoked session), force a non-silent reacquire
  //   rather than looping forever.
  // - Per-request scopes: right now every call uses environment.apiScopes.
  //   A real app calling multiple APIs would look up scopes per endpoint
  //   (e.g. via an HttpContext token set on the request) instead.
  // - Multi-account: MsalAuth is single-account today (see PROJECT_CONTEXT.md).
  //   If you add account switching, this interceptor needs to know which
  //   account's token to acquire.
  private async getFreshToken(): Promise<string> {
    try {
      const result = await MsalAuth.acquireTokenSilent({ scopes: environment.apiScopes });
      return result.accessToken;
    } catch (error: any) {
      if (error?.code === 'UI_REQUIRED') {
        // Silent renewal genuinely failed (refresh token expired/revoked) -
        // this is the one case where prompting the user again is correct.
        // TODO: an interactive prompt from inside an HTTP interceptor is
        // disruptive if it fires mid-background-refresh. Consider instead
        // surfacing a "session expired, please sign in again" state and
        // letting the user choose when to re-auth, rather than popping the
        // browser sheet unprompted here.
        const result = await MsalAuth.signIn({ scopes: environment.apiScopes });
        return result.accessToken;
      }
      throw error;
    }
  }
}
