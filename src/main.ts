import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { addIcons } from 'ionicons';
import { shieldCheckmark, logoMicrosoft, alertCircle, personCircle } from 'ionicons/icons';

import { AppModule } from './app/app.module';

// ion-icon's runtime SVG lookup (by bare `name="..."` string) breaks under
// Angular's esbuild-based application builder - it throws "Failed to
// construct 'URL': Invalid base URL" (ionic-team/ionic-framework#28497),
// which then cascades into createElementNS errors. Registering the icons
// this app actually uses up front avoids that lookup entirely.
addIcons({
  'shield-checkmark': shieldCheckmark,
  'logo-microsoft': logoMicrosoft,
  'alert-circle': alertCircle,
  'person-circle': personCircle,
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
