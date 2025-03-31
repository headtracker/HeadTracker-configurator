import { Component } from '@angular/core';
import { OutputComponent } from '@app/settings/output/output.component';
import { ImuComponent } from '@app/settings/imu/imu.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [OutputComponent, ImuComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {}
