import { Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { OutputsComponent } from '@app/channels/outputs/outputs.component';
import { PpmComponent } from '@app/channels/ppm/ppm.component';
import { BluetoothComponent } from '@app/channels/uart/bluetooth.component';
import { UartComponent } from '@app/channels/bluetooth/uart.component';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [MatTab, MatTabGroup, OutputsComponent, PpmComponent, BluetoothComponent, UartComponent],
  templateUrl: './channels.component.html',
})
export class ChannelsComponent {}
