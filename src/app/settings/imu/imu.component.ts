import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { filterCmds } from '@libs/headtracker/HeadTracker';
import { Messages } from '@libs/headtracker/Messages';
import { MatFormField } from '@angular/material/form-field';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { TriSlider, TriSliderRangeThumb } from '@libs/tri-slider';
import { Constants } from '@libs/headtracker/Settings';

@Component({
  selector: 'app-imu',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatSlider,
    MatSliderThumb,
    MatSelect,
    MatOption,
    MatCheckbox,
    TriSlider,
    TriSliderRangeThumb,
  ],
  templateUrl: './imu.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: `
    .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `,
})
export class ImuComponent implements OnInit {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private sub?: Subscription;

  // using signals for optimizing performance
  tilt = signal(0);
  roll = signal(0);
  pan = signal(0);

  axisForm = this.formBuilder.group({
    tilt: this.formBuilder.group({
      gain: [5],
      channel: [0],
      invert: [false],
      rangeMin: [Constants.DEF_MIN_PWM],
      rangeMid: [Constants.PPM_CENTER],
      rangeEnd: [Constants.DEF_MAX_PWM],
    }),
    roll: this.formBuilder.group({
      gain: [5],
      channel: [0],
      invert: [false],
      rangeMin: [Constants.DEF_MIN_PWM],
      rangeMid: [Constants.PPM_CENTER],
      rangeEnd: [Constants.DEF_MAX_PWM],
    }),
    pan: this.formBuilder.group({
      gain: [5],
      channel: [0],
      invert: [false],
      rangeMin: [Constants.DEF_MIN_PWM],
      rangeMid: [Constants.PPM_CENTER],
      rangeEnd: [Constants.DEF_MAX_PWM],
    }),
  });

  ngOnInit() {
    this.sub = this.HTService.$messages
      .pipe(
        filter(filterCmds),
        filter((message): message is Messages.Data => message.Cmd === 'Data'),
      )
      .subscribe((message) => {
        this.tilt.set(Math.round((message.tiltoff + Number.EPSILON) * 100) / 100);
        this.roll.set(Math.round((message.rolloff + Number.EPSILON) * 100) / 100);
        this.pan.set(Math.round((message.panoff + Number.EPSILON) * 100) / 100);
      });
  }

  protected readonly Constants = Constants;
}
