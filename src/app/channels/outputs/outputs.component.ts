import { Component, effect, inject, Input, OnDestroy, signal } from '@angular/core';
import { ChannelComponent } from '@app/channels/channel.component';
import { filter } from 'rxjs';
import { filterCmds } from '@libs/headtracker/HeadTracker';
import { Messages } from '@libs/headtracker/Messages';
import { SubSink } from 'subsink';
import { HeadTrackerService } from '@app/_services/head-tracker.service';

@Component({
  selector: 'app-outputs',
  standalone: true,
  imports: [ChannelComponent],
  templateUrl: './outputs.component.html',
})
export class OutputsComponent implements OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private subs = new SubSink();

  channels = signal<Uint16Array>(new Uint16Array(16));

  @Input('active')
  set active(value: boolean) {
    if (value) {
      this.HTService.readValues(['chout']).then();
    } else {
      this.HTService.stopReadingValues(['chout']).then();
    }
  }

  constructor() {
    // When the board connects, read the values
    effect(() => {
      if(this.HTService.connected()) {
        this.HTService.readValues(['chout']).then();
      }
    });

    this.subs.sink = this.HTService.$messages
      .pipe(
        filter(filterCmds),
        filter((message): message is Messages.Data => message.Cmd === 'Data'),
      )
      .subscribe((message) => {
        const chout = message['6choutu16'];
        if (chout) {
          const bytes = Uint8Array.from(atob(chout), (m) => m.codePointAt(0)!);
          const bytes16 = new Uint16Array(bytes.buffer);
          this.channels.set(bytes16);
        }
      });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.HTService.stopReadingValues(['chout']).then();
  }
}
