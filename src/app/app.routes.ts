import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'firmware' },
  {
    path: 'connect',
    loadComponent: () =>
      import('./connect/connect.component').then((x) => x.ConnectComponent),
  },
  {
    path: 'firmware',
    loadComponent: () =>
      import('./firmware/firmware.component').then((x) => x.FirmwareComponent),
  },
];
