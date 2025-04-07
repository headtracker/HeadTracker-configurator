import { Component, effect, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { SubSink } from 'subsink';
import { NgForOf } from '@angular/common';
import { debounceTime, filter, throttleTime } from 'rxjs';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatOption, MatSelect, ReactiveFormsModule, MatCheckboxModule, NgForOf],
  templateUrl: './general.component.html',
})
export class GeneralComponent implements OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private subs = new SubSink();

  @Input('active')
  set active(value: boolean) {
    if (value) {
      this.HTService.getAllBoardValues().then();
      this.HTService.readValues(['gyrocal']).then();
    } else {
      this.HTService.stopReadingValues(['gyrocal']).then();
    }
  }

  gyrocal = signal(false);

  form = this.formBuilder.group({
    buttonpin: [2],
    alertch: [-1],
    butlngps: [false],
    rstontlt: [false],
    rstonwave: [false],
    rotx: [0],
    roty: [0],
    rotz: [0],
  });

  constructor() {
    // When the board connects, read the values
    effect(() => {
      if(this.HTService.connected()) {
        this.HTService.readValues(['gyrocal']).then();
      }
    });

    this.subs.sink = this.HTService.$boardValues.subscribe((message) => {
      const newValues = {
        buttonpin: message.buttonpin ?? null,
        alertch: message.alertch ?? null,
        butlngps: message.butlngps ?? null,
        rstontlt: message.rstontlt ?? null,
        rstonwave: message.rstonwave ?? null,
        rotx: message.rotx ?? null,
        roty: message.roty ?? null,
        rotz: message.rotz ?? null,
      };
      this.form.patchValue(newValues, { emitEvent: false });
    });

    this.subs.sink = this.HTService.$dataMessages.subscribe((message) => {
      'gyrocal' in message && this.gyrocal.set(message['gyrocal']!);
    });

    this.mapChanges();
  }

  // Copy paste but at least readable
  private mapChanges() {
    const pipe = [debounceTime(500), throttleTime(500, undefined, { trailing: true })];

    // Recenter button
    this.subs.sink = this.form.controls.buttonpin.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ buttonpin: value });
      });
    // Reset alert channel
    this.subs.sink = this.form.controls.alertch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ alertch: value });
      });
    // Enable Tilt/Roll/Pan after a long button pres
    this.subs.sink = this.form.controls.butlngps.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ butlngps: value });
      });
    // Center on Roll from Min to Max
    this.subs.sink = this.form.controls.rstontlt.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rstontlt: value });
      });
    // Center on Proximity Detection
    this.subs.sink = this.form.controls.rstonwave.valueChanges
      .pipe(
        filter((value): value is boolean => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rstonwave: value });
      });

    //: {"Cmd":"Set","rstonwave":false}�*
    //: {"Cmd":"Set","rstonwave":false}*
    //  {"Cmd":"Set","rstonwave":true}ƀ
    //  {"Cmd":"Set","rstonwave":true}ƀ

    // Rotation X
    this.subs.sink = this.form.controls.rotx.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rotx: value });
      });
    // Rotation Y
    this.subs.sink = this.form.controls.roty.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ roty: value });
      });
    // Rotation Z
    this.subs.sink = this.form.controls.rotz.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ rotz: value });
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
