import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { MsalAuth, type AccountInfo } from '@nativelement/capacitor-msal-entra';
import { UserService } from '../core/services/user.service';

/**
 * DUMMY / SCAFFOLD COMPONENT - this is the "new user just signed in" step of
 * the flow, deliberately kept separate from HomePage so the extension point
 * is obvious. It is NOT wired into automatic navigation (see the TODO in
 * home.page.ts's signIn()) because there is no real backend yet to tell us
 * whether an account is actually new. Reachable
 * directly at /onboarding for manual testing in the meantime.
 *
 * ---------------------------------------------------------------------------
 * WHERE THIS FITS IN THE OVERALL FLOW
 * ---------------------------------------------------------------------------
 * 1. User taps "Continue with Microsoft Entra" -> HomePage.signIn() ->
 *    MsalAuth.signIn(). Control leaves the app (native browser sheet).
 * 2. Entra redirects back into the app (native deep link, handled entirely
 *    by the plugin's native code - nothing to do here). signIn() resolves.
 * 3. <<< YOU ARE HERE >>> This is the moment a real app decides: "have I
 *    seen this account before?" There is no single right way to answer
 *    that - see the TODO block below for the options and their tradeoffs.
 * 4. If new -> show this page, collect whatever profile info your product
 *    needs, POST it via UserService.create(). If returning -> skip straight
 *    to the signed-in home screen, as HomePage does today.
 */
@Component({
  selector: 'app-onboarding',
  templateUrl: 'onboarding.page.html',
  styleUrls: ['onboarding.page.scss'],
  standalone: false,
})
export class OnboardingPage {
  account: AccountInfo | null = null;
  displayName = '';
  email = '';
  submitting = false;
  errorMessage: string | null = null;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly toastController: ToastController,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    // TODO: decide how a "new user, needs onboarding" decision actually gets
    // made in your app. Common approaches, roughly in order of how much
    // backend work they require:
    //
    // 1. Ask your own backend: right after MsalAuth.signIn() resolves in
    //    HomePage, call something like
    //    `userService.lookupByAccountId(account.accountId)` (see the TODO in
    //    user.service.ts) and route here only on a 404. Most reliable, but
    //    needs that endpoint to exist.
    // 2. Custom claim from an Entra custom authentication extension /
    //    attribute collection during sign-up: decode `idTokenClaims` on the
    //    AccountInfo/ID token for something like `newUser: true`. Entra
    //    External ID can set this for you on first sign-up if configured -
    //    no round trip to your own backend needed, but requires tenant-side
    //    setup.
    // 3. Local-only heuristic (weakest): check `Preferences`/local storage
    //    for "have we completed onboarding for this accountId before" - only
    //    correct on the same device, breaks on reinstall/new device.
    //
    // This scaffold just reads whatever account is already signed in, purely
    // to have something to prefill/display below.
    this.account = (await MsalAuth.getAccount()).value;
  }

  async submit(): Promise<void> {
    if (!this.account) {
      this.errorMessage = 'No signed-in account found - sign in again first.';
      return;
    }

    this.errorMessage = null;
    this.submitting = true;
    try {
      // TODO: this hits UserService.create(), which currently has no real
      // backend behind it (environment.apiBaseUrl is a placeholder) - see
      // user.service.ts. Swap in real validation/fields for your product
      // (this demo only collects displayName/email).
      await firstValueFrom(
        this.userService.create({
          accountId: this.account.accountId,
          displayName: this.displayName,
          email: this.email,
        }),
      );

      await this.presentToast('Profile created.', 'success');
      // TODO: once this page is wired into the real sign-in flow, navigate
      // to wherever "fully signed in" actually lives instead of /home.
      await this.router.navigateByUrl('/home');
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Could not create profile. Please try again.';
    } finally {
      this.submitting = false;
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2000, color, position: 'top' });
    await toast.present();
  }
}
