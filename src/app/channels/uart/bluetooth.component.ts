import { Component } from '@angular/core';
import { ChannelComponent } from '@app/channels/channel.component';

@Component({
  selector: 'app-bluetooth',
  standalone: true,
  imports: [ChannelComponent],
  templateUrl: './bluetooth.component.html',
})
export class BluetoothComponent {}
