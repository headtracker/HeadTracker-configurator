import { Component } from '@angular/core';
import { OutputComponent } from '@app/settings/output/output.component';
import { ImuComponent } from '@app/settings/imu/imu.component';
import { TriSlider, TriSliderRangeThumb } from '@libs/tri-slider';
import { MatSlider, MatSliderRangeThumb } from '@angular/material/slider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { GeneralComponent } from '@app/settings/general/general.component';
import { PpmComponent } from '@app/settings/ppm/ppm.component';
import { UartComponent } from '@app/settings/uart/uart.component';
import { BluetoothComponent } from '@app/settings/bluetooth/bluetooth.component';
import { PwmComponent } from '@app/settings/pwm/pwm.component';
import { AnalogauxComponent } from '@app/settings/analogaux/analogaux.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    OutputComponent,
    ImuComponent,
    MatTabsModule,
    ReactiveFormsModule,
    GeneralComponent,
    PpmComponent,
    UartComponent,
    BluetoothComponent,
    PwmComponent,
    AnalogauxComponent,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  start = new FormControl('200');
  mid = new FormControl('300');
  end = new FormControl('400');
}
