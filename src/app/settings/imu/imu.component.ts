import { Component, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, debounceTime, filter, startWith, throttleTime, zip } from 'rxjs';
import { filterCmds } from '@libs/headtracker/HeadTracker';
import { Messages } from '@libs/headtracker/Messages';
import { MatFormField } from '@angular/material/form-field';
import { MatSlider, MatSliderThumb } from '@angular/material/slider';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { TriSlider, TriSliderRangeThumb } from '@libs/tri-slider';
import { Constants } from '@libs/headtracker/Settings';
import { SubSink } from 'subsink';
import { NgForOf } from '@angular/common';

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
    NgForOf,
  ],
  templateUrl: './imu.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: `
    .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `,
})
export class ImuComponent implements OnInit, OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private subs = new SubSink();

  // using signals for optimizing performance
  tilt = signal(0);
  roll = signal(0);
  pan = signal(0);

  axisForm = this.formBuilder.group({
    rll_min: [Constants.DEF_MIN_PWM],
    rll_cnt: [Constants.PPM_CENTER],
    rll_max: [Constants.DEF_MAX_PWM],
    rll_gain: [5],
    rllch: [-1],
    rll_reverse: [false],
    tlt_min: [Constants.DEF_MIN_PWM],
    tlt_cnt: [Constants.PPM_CENTER],
    tlt_max: [Constants.DEF_MAX_PWM],
    tlt_gain: [5],
    tltch: [-1],
    tlt_reverse: [false],
    pan_min: [Constants.DEF_MIN_PWM],
    pan_cnt: [Constants.PPM_CENTER],
    pan_max: [Constants.DEF_MAX_PWM],
    pan_gain: [5],
    panch: [-1],
    pan_reverse: [false],
  });

  ngOnInit() {
    // Live tilt roll and pan values
    this.subs.sink = this.HTService.$messages
      .pipe(
        filter(filterCmds),
        filter((message): message is Messages.Data => message.Cmd === 'Data'),
      )
      .subscribe((message) => {
        this.tilt.set(Math.round((message.tiltoff + Number.EPSILON) * 100) / 100);
        this.roll.set(Math.round((message.rolloff + Number.EPSILON) * 100) / 100);
        this.pan.set(Math.round((message.panoff + Number.EPSILON) * 100) / 100);
      });
    // init board values from the board
    this.subs.sink = this.HTService.$boardValues.subscribe((message) => {
      const newValues = {
        rll_min: message.rll_min ?? null,
        rll_cnt: message.rll_cnt ?? null,
        rll_max: message.rll_max ?? null,
        rll_gain: message.rll_gain ?? null,
        rllch: message.rllch ?? null,
        rll_reverse: message.servoreverse !== undefined ? !!(message.servoreverse & 2) : false,
        tlt_min: message.tlt_min ?? null,
        tlt_cnt: message.tlt_cnt ?? null,
        tlt_max: message.tlt_max ?? null,
        tlt_gain: message.tlt_gain ?? null,
        tltch: message.tltch ?? null,
        tlt_reverse: message.servoreverse !== undefined ? !!(message.servoreverse & 1) : false,
        pan_min: message.pan_min ?? null,
        pan_cnt: message.pan_cnt ?? null,
        pan_max: message.pan_max ?? null,
        pan_gain: message.pan_gain ?? null,
        panch: message.panch ?? null,
        pan_reverse: message.servoreverse !== undefined ? !!(message.servoreverse & 4) : false,
      };
      this.axisForm.patchValue(newValues, { emitEvent: false });
    });
    // Update value on form value change with a small debounce
    this.mapChanges();
  }

  // Copy paste but at least readable
  private mapChanges() {
    const pipe = [debounceTime(500), throttleTime(500, undefined, { trailing: true })];

    // TILT GAIN
    this.subs.sink = this.axisForm.controls.tlt_gain.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ tlt_gain: value });
      });
    // TILT MIN
    this.subs.sink = this.axisForm.controls.tlt_min.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ tlt_min: value });
      });
    // TILT CENTER
    this.subs.sink = this.axisForm.controls.tlt_cnt.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ tlt_cnt: value });
      });
    // TILT MAX
    this.subs.sink = this.axisForm.controls.tlt_max.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ tlt_max: value });
      });
    // TILT CHANNEL
    this.subs.sink = this.axisForm.controls.tltch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ tltch: value });
      });

    // ROLL GAIN
    this.subs.sink = this.axisForm.controls.rll_gain.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rll_gain: value });
      });
    // ROLL MIN
    this.subs.sink = this.axisForm.controls.rll_min.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rll_min: value });
      });
    // ROLL CENTER
    this.subs.sink = this.axisForm.controls.rll_cnt.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rll_cnt: value });
      });
    // ROLL MAX
    this.subs.sink = this.axisForm.controls.rll_max.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rll_max: value });
      });
    // ROLl CHANNEL
    this.subs.sink = this.axisForm.controls.rllch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rllch: value });
      });
    // PAN GAIN
    this.subs.sink = this.axisForm.controls.pan_gain.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pan_gain: value });
      });
    // PAN MIN
    this.subs.sink = this.axisForm.controls.pan_min.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pan_min: value });
      });
    // PAN CENTER
    this.subs.sink = this.axisForm.controls.pan_cnt.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pan_cnt: value });
      });
    // PAN MAX
    this.subs.sink = this.axisForm.controls.pan_max.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pan_max: value });
      });
    // PAN CHANNEL
    this.subs.sink = this.axisForm.controls.panch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ panch: value });
      });

    // REVERSE FLAG
    // If any of these changes recalculate the servoreverse value
    this.subs.sink = combineLatest([
      this.axisForm.controls.tlt_reverse.valueChanges.pipe(startWith(null)),
      this.axisForm.controls.rll_reverse.valueChanges.pipe(startWith(null)),
      this.axisForm.controls.pan_reverse.valueChanges.pipe(startWith(null))
    ]).subscribe(async ([tilt, roll, pan]) => {
        // If all values are null, do nothing - means the subscription initialized
        if(tilt === null && roll === null && pan === null) {
            return;
        }

        const tiltVal = this.axisForm.controls.tlt_reverse.value ? 1 : 0;
        const rollVal = this.axisForm.controls.rll_reverse.value ? 2 : 0;
        const panVal = this.axisForm.controls.pan_reverse.value ? 4 : 0;

        await this.HTService.setValues({ servoreverse: tiltVal + rollVal + panVal });
    })
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  protected readonly Constants = Constants;
}
