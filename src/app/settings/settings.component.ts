import { Component } from '@angular/core';
import { OutputComponent } from '@app/settings/output/output.component';
import { ImuComponent } from '@app/settings/imu/imu.component';
import { TriSlider, TriSliderRangeThumb } from '@libs/tri-slider';
import { MatSlider, MatSliderRangeThumb } from '@angular/material/slider';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    OutputComponent,
    ImuComponent,
    TriSlider,
    TriSliderRangeThumb,
    MatSlider,
    MatSliderRangeThumb,
    ReactiveFormsModule,
  ],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {

  start = new FormControl('200');
  mid = new FormControl('300');
  end = new FormControl('400');
}
