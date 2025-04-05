import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubSink } from 'subsink';
import { NgForOf } from '@angular/common';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import { debounceTime, filter, throttleTime } from 'rxjs';

@Component({
  selector: 'app-uart',
  standalone: true,
  imports: [MatFormFieldModule, MatOptionModule, MatSelectModule, ReactiveFormsModule, NgForOf, MatInput, MatCheckbox],
  templateUrl: './uart.component.html',
})
export class UartComponent implements OnInit, OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private subs = new SubSink();

  form = this.formBuilder.group({
    uartmode: [0],
    sbustxrate: [80],
    sboutinv: [false],
    sbininv: [false],
    crsftxrate: [140],
    ch5arm: [false],
    crsftxinv: [false],
  });


  ngOnInit() {
    // init board values from the board
    this.subs.sink = this.HTService.$boardValues.subscribe((message) => {
      const newValues = {
        uartmode: message.uartmode ?? null,
        sbustxrate: message.sbustxrate ?? null,
        sboutinv: message.sboutinv ?? null,
        sbininv: message.sbininv ?? null,
        crsftxrate: message.crsftxrate ?? null,
        ch5arm: message.ch5arm ?? null,
        crsftxinv: message.crsftxinv ?? null,
      };
      this.form.patchValue(newValues, { emitEvent: false });
    });

    this.mapChanges();
  }

  // Copy paste but at least readable
  private mapChanges() {
    const pipe = [debounceTime(500), throttleTime(500, undefined, { trailing: true })];

    // UART Mode
    this.subs.sink = this.form.controls.uartmode.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ uartmode: value });
      });

    // Sbus transfer rate
    this.subs.sink = this.form.controls.sbustxrate.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ sbustxrate: value });
      });

    // Sbus output inverted
    this.subs.sink = this.form.controls.sboutinv.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ sboutinv: value });
      });

    // Sbus input inverted
    this.subs.sink = this.form.controls.sbininv.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ sbininv: value });
      });

    // CRSF transfer rate
    this.subs.sink = this.form.controls.crsftxrate.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ crsftxrate: value });
      });

    // CRSF Ch5 arm
    this.subs.sink = this.form.controls.ch5arm.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ ch5arm: value });
      });


    // CRSF TX inverted
    this.subs.sink = this.form.controls.crsftxinv.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ crsftxinv: value });
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
