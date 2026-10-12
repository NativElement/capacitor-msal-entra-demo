import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    // Reachable directly for manual testing - see the comment atop
    // OnboardingPage for why it's not auto-navigated to from signIn() yet.
    path: 'onboarding',
    loadChildren: () => import('./onboarding/onboarding.module').then((m) => m.OnboardingPageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
