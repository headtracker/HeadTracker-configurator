import { inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { ConnectionService } from './connection.service';
import { filterCmds, HeadTracker } from '@libs/headtracker/HeadTracker';
import { BehaviorSubject, filter, tap } from 'rxjs';
import { Messages } from '@libs/headtracker/Messages';
import { SubSink } from 'subsink';

@Injectable({
  providedIn: 'root',
})
export class HeadTrackerService implements OnDestroy {
  private subs = new SubSink();
  private messageSubs = new SubSink();
  readonly connectionService: ConnectionService = inject(ConnectionService);
  private readonly tracker: HeadTracker = new HeadTracker();

  public connected: boolean = false;
  public firmwareVersion?: string;
  public hardwareVersion?: string;
  public gitVersion?: string;

  private boardValuesSubject = new BehaviorSubject<Partial<Messages.Get>>({});
  public $boardValues = this.boardValuesSubject.asObservable();

  constructor() {
    this.subs.sink = this.connectionService.$connectedPort.subscribe(async (port) => {
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

    this.messageSubs.sink = this.$messages.subscribe((message) => {
      // console.info('Received message:', message);
    });

    // Get the firmware version
    this.messageSubs.sink = this.$messages.pipe(
      filter(filterCmds),
      filter((message): message is Messages.FW => message.Cmd === 'FW'),
      tap(console.info),
    ).subscribe((message) => {
      this.firmwareVersion = message.Vers;
      this.hardwareVersion = message.Hard;
      this.gitVersion = message.Git;
    });

    // Get the board values
    this.messageSubs.sink = this.$messages.pipe(
      filter(filterCmds),
      filter((message): message is Messages.Get => message.Cmd === 'Set'),
      tap(console.info),
    ).subscribe((message) => {
      this.boardValuesSubject.next(message)
    });

    await this.tracker.sendCommand('FW');
    await this.tracker.sendCommand('Get');
    await this.tracker.sendCommand('RD', {
      panout: true,
      rollout: true,
      tiltout: true,
      panoff: true,
      rolloff: true,
      tiltoff: true,
    });

  }

  get $messages() {
    return this.tracker.$messages;
  }

  public async openConnection() {
    if (this.connectionService.port) {
      await this.initConnection(this.connectionService.port)
    } else {
      console.error('No port available to connect to.');
    }
  }

  public async closeConnection() {
    await this.tracker.disconnect();
    this.messageSubs.unsubscribe();
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

  public async saveToFlash() {
    if (this.connected) {
      await this.tracker.sendCommand('Flash');
    }
  }

  public async setValues(values: Partial<Messages.Get>) {
    if (this.connected) {
      await this.tracker.sendCommand('Set', values);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
