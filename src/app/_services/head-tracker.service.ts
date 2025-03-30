import { inject, Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { filterCmds, HeadTracker } from '@libs/headtracker/HeadTracker';
import { filter } from 'rxjs';
import { Messages } from '@libs/headtracker/Messages';

@Injectable({
  providedIn: 'root',
})
export class HeadTrackerService {
  readonly connectionService: ConnectionService = inject(ConnectionService);
  private readonly tracker: HeadTracker = new HeadTracker();

  public connected: boolean = false;
  public firmwareVersion?: string;
  public hardwareVersion?: string;
  public gitVersion?: string;

  constructor() {
    this.connectionService.$connectedPort.subscribe(async (port) => {
      if (port) {
        // Only connect if the port is the one we want, don't want to connect if it's in bootloader mode
        if (port.getInfo().usbProductId === 0x805a)
          await this.initConnection(port);
      } else {
        await this.closeConnection();
      }
    });
  }

  private async initConnection(port: SerialPort) {
    await this.tracker.connect(port);
    this.connected = true;

    this.$messages.subscribe((message) => {
      // console.info('Received message:', message);
    });

    this.$messages.pipe(
      filter(filterCmds),
      filter((message): message is Messages.FW => message.Cmd === 'FW'),
    ).subscribe((message) => {
      this.firmwareVersion = message.Vers;
      this.hardwareVersion = message.Hard;
      this.gitVersion = message.Git;
    });

    await this.tracker.sendCommand('FW');
    await this.tracker.sendCommand('Get');
    await this.tracker.sendCommand('RD', {
      panout: true,
      rollout: true,
      tiltout: true,
    });
  }

  get $messages() {
    return this.tracker.$messages;
  }

  public async closeConnection() {
    await this.tracker.disconnect();
    this.connected = false;
  }

  public async resetCenter() {
    if (this.connected) {
      await this.tracker.sendCommand('RstCnt');
    }
  }

  public async reset() {
    if (this.connected) {
      await this.tracker.sendCommand('Reboot');
    }
  }
}
