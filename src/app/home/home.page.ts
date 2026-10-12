import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { MsalAuth, type AccountInfo } from '@nativelement/capacitor-msal-entra';
import { environment } from '../../environments/environment';

// 'openid', 'profile' and 'offline_access' are reserved scopes that MSAL
// adds to every request automatically - passing them explicitly causes
// MSAL to reject the call (MSALErrorDomain -50000). Only list scopes for
// an actual protected resource here (e.g. an API's access_as_user scope).
// Requesting environment.apiScopes here too (not just in AuthInterceptor)
// means the user consents to them during this initial interactive sign-in,
// instead of hitting a second consent prompt the first time a silent token
// acquisition for the API needs it.
const API_SCOPES: string[] = environment.apiScopes;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  account: AccountInfo | null = null;
  busy = false;
  errorMessage: string | null = null;

  constructor(
    private readonly toastController: ToastController,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    // On native, picks up an account cached from a previous app launch. On
    // web/PWA this is also how a just-completed sign-in surfaces at all:
    // MsalAuthWeb.signIn() uses msal-browser's loginRedirect(), which
    // navigates the whole page away and back rather than resolving in place
    // (Microsoft recommends redirect over popup for reliability in Safari/
    // mobile/PWA contexts) - so this ngOnInit hook, not signIn()'s return
    // value, is what updates the UI after that round trip. Swallow errors:
    // no cached account (or no msal_config.json yet on web) just means
    // "not signed in", not a failure worth surfacing.
    try {
      this.account = (await MsalAuth.getAccount()).value;
    } catch {
      this.account = null;
    } finally {
      this.cdr.detectChanges();
    }
  }

  async signIn(): Promise<void> {
    this.errorMessage = null;
    this.busy = true;
    try {
      // Google/Apple sign-in doesn't need a separate button or domainHint -
      // once those providers are added to the tenant's user flow, Entra's
      // own hosted sign-in page shows them as options alongside email.
      const result = await MsalAuth.signIn({ scopes: API_SCOPES });
      this.account = (await MsalAuth.getAccount()).value;

      // TODO: this is the extension point for "is this a brand-new user?".
      // Control has just returned from Entra with a signed-in account, and
      // this is where a real app decides whether to route to a registration/
      // profile-completion step before treating the user as fully signed in.
      // See OnboardingPage (src/app/onboarding) for a scaffolded example of
      // that step and the detection options it documents in more depth. A
      // wired-up version of this would look roughly like:
      //
      //   const isNewUser = await checkIfNewUser(this.account);
      //   if (isNewUser) {
      //     await this.router.navigateByUrl('/onboarding');
      //     return;
      //   }
      //
      // Left unwired here because `checkIfNewUser` needs a real backend
      // (UserService.lookupByAccountId - see user.service.ts) or a tenant-
      // side custom claim that this demo tenant isn't configured with yet.

      await this.presentToast(`Welcome${this.account?.username ? ', ' + this.account.username : ''}!`, 'success');
      console.log('signIn result', result);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busy = false;
      this.cdr.detectChanges();
    }
  }

  async signOut(): Promise<void> {
    this.errorMessage = null;
    this.busy = true;
    try {
      await MsalAuth.signOut();
      this.account = null;
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busy = false;
      this.cdr.detectChanges();
    }
  }

  private handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    this.errorMessage = message;
    console.error('MsalAuth error', error);
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
