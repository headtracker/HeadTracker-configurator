import { Component } from '@angular/core';
import { ChannelComponent } from '@app/channels/channel.component';

@Component({
  selector: 'app-outputs',
  standalone: true,
  imports: [ChannelComponent],
  templateUrl: './outputs.component.html',
})
export class OutputsComponent {}
