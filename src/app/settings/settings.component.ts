import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { filter, Subscription } from 'rxjs';
import { filterCmds } from '@libs/headtracker/HeadTracker';
import { Messages } from '@libs/headtracker/Messages';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit, OnDestroy {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  private sub?: Subscription;

  pan: number = 0;
  tilt: number = 0;
  roll: number = 0;

  ngOnInit() {
    this.sub = this.HTService.$messages
      .pipe(
        filter(filterCmds),
        filter((message): message is Messages.Data => message.Cmd === 'Data'),
      )
      .subscribe((message) => {
        this.pan = message.panout;
        this.tilt = message.tiltout;
        this.roll = message.rollout;
      });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
