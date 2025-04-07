import { inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { ConnectionService } from './connection.service';
import { filterCmds, HeadTracker } from '@libs/headtracker/HeadTracker';
import { BehaviorSubject, filter, tap } from 'rxjs';
import {  Messages } from '@libs/headtracker/Messages';
import { SubSink } from 'subsink';
import { NotificationsService } from '@app/_services/notifications.service';

@Injectable({
  providedIn: 'root',
})
export class HeadTrackerService implements OnDestroy {
  private subs = new SubSink();
  private messageSubs = new SubSink();
  readonly connectionService: ConnectionService = inject(ConnectionService);
  readonly notifications = inject(NotificationsService);
  private readonly tracker: HeadTracker = new HeadTracker();

  public connected = signal(false);
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
    this.connected.set(true)

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

    this.notifications.push('Head Tracker Connected');

  }

  get $messages() {
    return this.tracker.$messages;
  }

  get $dataMessages() {
    return this.tracker.$messages.pipe(
      filter(filterCmds),
      filter((message): message is Messages.Data => message.Cmd === 'Data'),
    );
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
    this.connected.set(false);
    this.notifications.push('Connection closed to Head Tracker');
  }

  public async resetCenter() {
    if (this.connected()) {
      await this.tracker.sendCommand('RstCnt');
      this.notifications.push('Center reset');
    }
  }

  public async reset() {
    if (this.connected()) {
      await this.tracker.sendCommand('Reboot');
      this.notifications.push('Board rebooting');
    }
  }

  public async saveToFlash() {
    if (this.connected()) {
      await this.tracker.sendCommand('Flash');
      this.notifications.push('Values saved to flash');
    }
  }

  public async setValues(values: Partial<Messages.Get>) {
    if (this.connected()) {
      await this.tracker.sendCommand('Set', values);

      // // Get the set values from the board so the UI and board don't get out of sync
      // setTimeout(async () => {
      //   await this.tracker.sendCommand('Get');
      // }, 550);
    }
  }

  public async stopSendingAll() {
    if (this.connected()) {
      await this.tracker.sendCommand('D--');
    }
  }

  public async readValues(input: (keyof Messages.Data)[]) {
    if (this.connected()) {
      const values: any = {}
      input.forEach((key) => {
        values[key] = true;
      })

      await this.tracker.sendCommand('RD', values);
    }
  }

  public async stopReadingValues(input: (keyof Messages.Data)[]) {
    if (this.connected()) {
      const values: any = {}
      input.forEach((key) => {
        values[key] = false;
      })

      await this.tracker.sendCommand('RD', values);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
