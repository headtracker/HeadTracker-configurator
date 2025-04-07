import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { NgForOf } from '@angular/common';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubSink } from 'subsink';
import { debounceTime, filter, throttleTime } from 'rxjs';

@Component({
  selector: 'app-pwm',
  standalone: true,
  imports: [MatFormField, MatLabel, MatOption, MatSelect, NgForOf, ReactiveFormsModule],
  templateUrl: './pwm.component.html',
})
export class PwmComponent implements OnInit, OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private subs = new SubSink();

  form = this.formBuilder.group({
    pwm0: [-1],
    pwm1: [-1],
    pwm2: [-1],
    pwm3: [-1],
  });

  ngOnInit() {
    // init board values from the board
    this.subs.sink = this.HTService.$boardValues.subscribe((message) => {
      const newValues = {
        pwm0: message.pwm0 ?? null,
        pwm1: message.pwm1 ?? null,
        pwm2: message.pwm2 ?? null,
        pwm3: message.pwm3 ?? null,
      };
      this.form.patchValue(newValues, { emitEvent: false });
    });

    this.mapChanges();
  }

  private mapChanges() {
    const pipe = [debounceTime(500), throttleTime(500, undefined, { trailing: true })];

    // PWM A0
    this.subs.sink = this.form.controls.pwm0.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pwm0: value });
      });

    // PWM A1
    this.subs.sink = this.form.controls.pwm1.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pwm1: value });
      });

    // PWM A2
    this.subs.sink = this.form.controls.pwm2.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pwm2: value });
      });

    // PWM A3
    this.subs.sink = this.form.controls.pwm3.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ pwm3: value });
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
