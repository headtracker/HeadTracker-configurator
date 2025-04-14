import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { MatIcon } from '@angular/material/icon';
import { NotificationsService } from '@app/_services/notifications.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatButton, MatIcon, AsyncPipe],
  templateUrl: './footer.component.html',
  host: { class: 'shadow-inner border bg-white p-2 flex flex-row items-center justify-between sticky w-full bottom-0 mt-auto z-40' },
})
export class FooterComponent {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);
  readonly notifications: NotificationsService = inject(NotificationsService);

  async resetCenter() {
    await this.HTService.resetCenter();
  }

  async saveToFlash() {
    await this.HTService.saveToFlash();
  }
}
