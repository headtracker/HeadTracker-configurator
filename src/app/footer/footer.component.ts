import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { HeadTrackerService } from '@app/_services/head-tracker.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatButton, MatIcon],
  templateUrl: './footer.component.html',
  host: { class: 'shadow-inner border bg-white p-4 flex flex-row sticky w-full bottom-0 mt-auto' },
})
export class FooterComponent {
  readonly HTService: HeadTrackerService = inject(HeadTrackerService);

  async resetCenter() {
    await this.HTService.resetCenter();
  }

  async saveToFlash() {
    await this.HTService.saveToFlash();
  }
}
