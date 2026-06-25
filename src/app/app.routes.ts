import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./chat/chat.component').then((m) => m.ChatComponent),
  },
  { path: '**', redirectTo: '' },
];
