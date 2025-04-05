import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'settings' },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings.component').then((x) => x.SettingsComponent),
  },
  {
    path: 'firmware',
    loadComponent: () =>
      import('./firmware/firmware.component').then((x) => x.FirmwareComponent),
  },
  {
    path: 'channels',
    loadComponent: () =>
      import('./channels/channels.component').then((x) => x.ChannelsComponent),
  },
  {
    path: 'calibrate',
    loadComponent: () =>
      import('./calibrate/calibrate.component').then((x) => x.CalibrateComponent),
  },
];
