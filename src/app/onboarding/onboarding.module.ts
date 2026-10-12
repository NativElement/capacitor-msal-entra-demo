import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { FormsModule } from '@angular/forms';
import { OnboardingPage } from './onboarding.page';

import { OnboardingPageRoutingModule } from './onboarding-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, OnboardingPageRoutingModule],
  declarations: [OnboardingPage],
})
export class OnboardingPageModule {}
