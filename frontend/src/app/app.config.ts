import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { jwtInterceptor, errorInterceptor } from './core/interceptors/jwt.interceptor';
import { registerLocaleData } from '@angular/common';
import localeIn from '@angular/common/locales/en-IN';

registerLocaleData(localeIn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'en-IN' }
  ]
};
