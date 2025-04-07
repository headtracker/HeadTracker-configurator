import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { NgForOf } from '@angular/common';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubSink } from 'subsink';
import { debounceTime, filter, throttleTime } from 'rxjs';
import { Constants } from '@libs/headtracker/Settings';

@Component({
  selector: 'app-analogaux',
  standalone: true,
  imports: [MatFormField, MatInput, MatLabel, MatOption, MatSelect, NgForOf, ReactiveFormsModule],
  templateUrl: './analogaux.component.html',
})
export class AnalogauxComponent implements OnInit, OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private subs = new SubSink();

  form = this.formBuilder.group({
    an0gain: [310],
    an1gain: [310],
    an2gain: [310],
    an3gain: [310],
    an0off: [0],
    an1off: [0],
    an2off: [0],
    an3off: [0],
    an0ch: [-1],
    an1ch: [-1],
    an2ch: [-1],
    an3ch: [-1],
    aux0func: [0],
    aux1func: [0],
    aux2func: [0],
    aux0ch: [-1],
    aux1ch: [-1],
    aux2ch: [-1],
  });

  ngOnInit() {
    // init board values from the board
    this.subs.sink = this.HTService.$boardValues.subscribe((message) => {
      const newValues = {
        an0gain: message.an0gain ?? null,
        an1gain: message.an1gain ?? null,
        an2gain: message.an2gain ?? null,
        an3gain: message.an3gain ?? null,
        an0off: message.an0off ?? null,
        an1off: message.an1off ?? null,
        an2off: message.an2off ?? null,
        an3off: message.an3off ?? null,
        an0ch: message.an0ch ?? null,
        an1ch: message.an1ch ?? null,
        an2ch: message.an2ch ?? null,
        an3ch: message.an3ch ?? null,
        aux0func: message.aux0func ?? null,
        aux1func: message.aux1func ?? null,
        aux2func: message.aux2func ?? null,
        aux0ch: message.aux0ch ?? null,
        aux1ch: message.aux1ch ?? null,
        aux2ch: message.aux2ch ?? null,
      };
      this.form.patchValue(newValues, { emitEvent: false });
    });

    this.mapChanges();
  }

  private mapChanges() {
    const pipe = [debounceTime(500), throttleTime(500, undefined, { trailing: true })];

    // Analog A4 Gain
    this.subs.sink = this.form.controls.an0gain.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an0gain: value });
      });
    // Analog A5 Gain
    this.subs.sink = this.form.controls.an1gain.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an1gain: value });
      });
    // Analog A6 Gain
    this.subs.sink = this.form.controls.an2gain.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an2gain: value });
      });
    // Analog A7 Gain
    this.subs.sink = this.form.controls.an3gain.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an3gain: value });
      });
    // Analog A4 Offset
    this.subs.sink = this.form.controls.an0off.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an0off: value });
      });
    // Analog A5 Offset
    this.subs.sink = this.form.controls.an1off.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an1off: value });
      });
    // Analog A6 Offset
    this.subs.sink = this.form.controls.an2off.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an2off: value });
      });
    // Analog A7 Offset
    this.subs.sink = this.form.controls.an3off.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an3off: value });
      });
    // Analog A4 Channel
    this.subs.sink = this.form.controls.an0ch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an0ch: value });
      });
    // Analog A5 Channel
    this.subs.sink = this.form.controls.an1ch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an1ch: value });
      });
    // Analog A6 Channel
    this.subs.sink = this.form.controls.an2ch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an2ch: value });
      });
    // Analog A7 Channel
    this.subs.sink = this.form.controls.an3ch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ an3ch: value });
      });
    // Aux 1 Function
    this.subs.sink = this.form.controls.aux0func.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ aux0func: value });
      });
    // Aux 2 Function
    this.subs.sink = this.form.controls.aux1func.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ aux1func: value });
      });
    // Aux 3 Function
    this.subs.sink = this.form.controls.aux2func.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ aux2func: value });
      });
    // Aux 1 Channel
    this.subs.sink = this.form.controls.aux0ch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ aux0ch: value });
      });
    // Aux 2 Channel
    this.subs.sink = this.form.controls.aux1ch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ aux1ch: value });
      });
    // Aux 3 Channel
    this.subs.sink = this.form.controls.aux2ch.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ aux2ch: value });
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  protected readonly Constants = Constants;
}

