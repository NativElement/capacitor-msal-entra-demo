import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfile,
} from '../models/user-profile.model';

/**
 * Scaffolded CRUD client for an app-side "user profile" API.
 *
 * There is no backend behind this yet (see PROJECT_CONTEXT.md) - this class
 * only exists to show the shape a real implementation would take once one
 * exists: plain HttpClient calls against `environment.apiBaseUrl`, with the
 * bearer token attached automatically by AuthInterceptor (see
 * auth.interceptor.ts) rather than handled here. Every method below will
 * currently reject with an HTTP error since `apiBaseUrl` is a placeholder.
 *
 * TODO: point `environment.apiBaseUrl` at a real API and adjust the routes/
 * payload shapes below to match its actual contract.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  /** GET /users - list profiles. TODO: add paging/filtering params once the API supports them. */
  list(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.baseUrl);
  }

  /** GET /users/:id */
  get(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /users - create the app-side profile for a just-signed-in Entra
   * account. Called from the "new user" extension point - see
   * OnboardingPage (src/app/onboarding) and the TODO in home.page.ts's
   * signIn() for where this fits in the sign-in flow.
   */
  create(request: CreateUserProfileRequest): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.baseUrl, request);
  }

  /** PUT /users/:id - update mutable profile fields (not the linked accountId). */
  update(id: string, request: UpdateUserProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/${id}`, request);
  }

  /** DELETE /users/:id */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // TODO: other extension points worth adding once a real backend exists:
  // - lookupByAccountId(accountId): the natural "does this Entra account
  //   already have a profile?" check to run right after signIn() succeeds.
  // - Centralized error mapping (404 -> "no profile yet" vs. a genuine
  //   network/server error) so callers like OnboardingPage don't each
  //   reimplement that distinction.
}
