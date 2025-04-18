import { Component, effect, inject, Input, OnDestroy, signal } from '@angular/core';
import { ChannelComponent } from '@app/channels/channel.component';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { SubSink } from 'subsink';
import { filter } from 'rxjs';
import { filterCmds } from '@libs/headtracker/HeadTracker';
import { Messages } from '@libs/headtracker/Messages';

@Component({
  selector: 'app-ppm',
  standalone: true,
  imports: [ChannelComponent],
  templateUrl: './ppm.component.html',
})
export class PpmComponent implements OnDestroy{
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private subs = new SubSink();

  channels = signal<Uint16Array>(new Uint16Array(16));

  @Input('active')
  set active(value: boolean) {
    if (value) {
      this.HTService.readValues(['ppmch']).then();
    } else {
      this.HTService.stopReadingValues(['ppmch']).then();
    }
  }

  constructor() {
    // When the board connects, read the values
    effect(() => {
      if(this.HTService.connected()) {
        this.HTService.readValues(['ppmch']).then();
      }
    });

    this.subs.sink = this.HTService.$messages
      .pipe(
        filter(filterCmds),
        filter((message): message is Messages.Data => message.Cmd === 'Data'),
      )
      .subscribe((message) => {
        const ppmch = message['6ppmchu16'];
        if (ppmch) {
          const bytes = Uint8Array.from(atob(ppmch), (m) => m.codePointAt(0)!);
          const bytes16 = new Uint16Array(bytes.buffer);
          this.channels.set(bytes16);
        }
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.HTService.stopReadingValues(['ppmch']).then();
  }
}
