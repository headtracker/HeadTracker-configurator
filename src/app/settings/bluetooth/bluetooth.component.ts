import { Component, effect, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SubSink } from 'subsink';
import { debounceTime, filter, throttleTime } from 'rxjs';

@Component({
  selector: 'app-bluetooth',
  standalone: true,
  imports: [MatFormField, MatOption, MatSelect, ReactiveFormsModule],
  templateUrl: './bluetooth.component.html',
})
export class BluetoothComponent implements OnDestroy {
  private textDecoder = new TextDecoder();
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private formBuilder = inject(FormBuilder);
  private subs = new SubSink();

  // using signals for optimizing performance
  btaddrchr = signal<string | null>(null);
  btrmtchr = signal<string | null>(null);
  btcon = signal<boolean | null>(false);

  @Input('active')
  set active(value: boolean) {
    if (value) {
      this.HTService.readValues(['btaddr', 'btcon', 'btrmt']).then();
    } else {
      this.HTService.stopReadingValues(['btaddr', 'btcon', 'btrmt']).then();
    }
  }

  form = this.formBuilder.group({
    btmode: [-1],
  });

  constructor() {
    // When the board connects, read the values
    effect(() => {
      if(this.HTService.connected()) {
        this.HTService.readValues(['btaddr', 'btcon', 'btrmt']).then();
      }
    });
    // init board values from the board
    this.subs.sink = this.HTService.$boardValues.subscribe((message) => {
      const newValues = {
        btmode: message.btmode ?? null,
      };
      this.form.patchValue(newValues, { emitEvent: false });
    });

    this.subs.sink = this.HTService.$dataMessages.subscribe((message) => {
      const btaddr = message['6btaddrchr'];
      if (btaddr) {
        const bytes = Uint8Array.from(atob(btaddr), (m) => m.codePointAt(0)!);
        const addr = this.textDecoder.decode(bytes);
        this.btaddrchr.set(addr);
      }

      '6btrmtchr' in message && this.btrmtchr.set(message['6btrmtchr']!);
      'btcon' in message && this.btcon.set(message.btcon!);
    });

    this.mapChanges();
  }

  // Copy paste but at least readable
  private mapChanges() {
    const pipe = [debounceTime(500), throttleTime(500, undefined, { trailing: true })];

    // TILT GAIN
    this.subs.sink = this.form.controls.btmode.valueChanges
      .pipe(
        filter((value): value is number => value !== null && value !== undefined),
        ...(pipe as []),
      )
      .subscribe(async (value) => {
        await this.HTService.setValues({ btmode: value });
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.HTService.stopReadingValues(['btaddr', 'btcon', 'btrmt']).then();
  }
}
