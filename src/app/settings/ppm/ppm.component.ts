import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgForOf } from '@angular/common';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SubSink } from 'subsink';
import { Constants } from '@libs/headtracker/Settings';
import { debounceTime, filter, throttleTime } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-ppm',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    NgForOf,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './ppm.component.html',
})
export class PpmComponent implements OnInit, OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private subs = new SubSink();

  form = this.formBuilder.group({
    ppmoutpin: [-1],
    ppmchcnt: [8],
    ppmoutinvert: [false],
    ppmframe: [22500 / 1000],
    ppmsync: [350],
    ppminpin: [-1],
    ppmininvert: [false],
  });

  ngOnInit() {
    // init board values from the board
    this.subs.sink = this.HTService.$boardValues.subscribe((message) => {
      const newValues = {
        ppmoutpin: message.ppmoutpin ?? null,
        ppmchcnt: message.ppmchcnt ?? null,
        ppmoutinvert: message.ppmoutinvert ?? null,
        ppmframe: message.ppmframe !== undefined ? message.ppmframe / 1000 : null,
        ppmsync: message.ppmsync ?? null,
        ppminpin: message.ppminpin ?? null,
        ppmininvert: message.ppmininvert ?? null,
      };
      this.form.patchValue(newValues, { emitEvent: false });
    });

    this.mapChanges();
  }

  // Copy paste but at least readable
  private mapChanges() {
    const pipe = [debounceTime(500), throttleTime(500, undefined, { trailing: true })];

    // PPM output pin
    this.subs.sink = this.form.controls.ppmoutpin.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ppmoutpin: value });
      });

    // PPM Channels Count
    this.subs.sink = this.form.controls.ppmchcnt.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ppmchcnt: value });
      });

    // PPM Out invert
    this.subs.sink = this.form.controls.ppmoutinvert.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ppmoutinvert: value });
      });

    // PPM Frame
    this.subs.sink = this.form.controls.ppmframe.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ppmframe: Math.round(value * 1000) });
      });

    // PPM Sync
    this.subs.sink = this.form.controls.ppmsync.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ppmsync: value });
      });

    // PPM input pin
    this.subs.sink = this.form.controls.ppminpin.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ppminpin: value });
      });

    // PPM In invert
    this.subs.sink = this.form.controls.ppmininvert.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ppmininvert: value });
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  get maxFrameLength() {
    if (this.form.controls.ppmchcnt.value === null) {
      return
    }
    return Constants.PPM_MIN_FRAMESYNC + this.form.controls.ppmchcnt.value * Constants.MAX_PWM;
  }

  protected readonly Constants = Constants;
}
