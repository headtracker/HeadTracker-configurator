import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'connect' },
  {
    path: 'connect',
    loadComponent: () =>
      import('./connect/connect.component').then((x) => x.ConnectComponent),
  },
];
