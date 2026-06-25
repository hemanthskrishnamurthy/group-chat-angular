import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { LogIn, LucideAngularModule, MessageCircle, Send, Users, Wifi, WifiOff, X } from 'lucide-angular';
import { AppComponent } from './app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(appRoutes, withComponentInputBinding()),
    importProvidersFrom(
      LucideAngularModule.pick({
        LogIn,
        MessageCircle,
        Send,
        Users,
        Wifi,
        WifiOff,
        X,
      }),
    ),
  ],
}).catch((error) => console.error(error));
