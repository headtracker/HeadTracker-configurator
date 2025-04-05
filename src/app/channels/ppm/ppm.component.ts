import { Component } from '@angular/core';
import { ChannelComponent } from '@app/channels/channel.component';

@Component({
  selector: 'app-ppm',
  standalone: true,
  imports: [ChannelComponent],
  templateUrl: './ppm.component.html',
})
export class PpmComponent {}
