/**
 * App-side user profile, as distinct from the Entra `AccountInfo` the plugin
 * returns. `AccountInfo` tells you *who signed in*; this is *your own app's*
 * record for that person (roles, preferences, whatever your product needs).
 *
 * TODO: replace with whatever shape your real backend returns.
 */
export interface UserProfile {
  /** Your backend's own user id (not the same as MSAL's accountId - keep both around). */
  id: string;
  /** Stable MSAL account identifier this profile is linked to, from AccountInfo.accountId. */
  accountId: string;
  displayName: string;
  email: string;
  role: 'member' | 'admin';
  createdAt: string;
}

/** Fields the client is allowed to send when creating a profile. */
export type CreateUserProfileRequest = Pick<UserProfile, 'accountId' | 'displayName' | 'email'>;

/** Fields the client is allowed to send when updating a profile. */
export type UpdateUserProfileRequest = Partial<Pick<UserProfile, 'displayName' | 'email'>>;
