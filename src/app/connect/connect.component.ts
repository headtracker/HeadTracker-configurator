import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-connect',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './connect.component.html',
})
export class ConnectComponent {
  readonly connectionService: ConnectionService = inject(ConnectionService);

  async selectSerialPort(): Promise<void> {
    await this.connectionService.selectSerialPort();
  }
}
