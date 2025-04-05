import { Component } from '@angular/core';
import { ChannelComponent } from '@app/channels/channel.component';

@Component({
  selector: 'app-uart',
  standalone: true,
  imports: [ChannelComponent],
  templateUrl: './uart.component.html',
})
export class UartComponent {}
