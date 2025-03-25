import { Injectable } from '@angular/core';
import { sleep } from '@bossa-web/src/util';
import { SamBA } from '@bossa-web/src/samba';
import { Device } from '@bossa-web/src/device';
import { Flasher, FlasherObserver } from '@bossa-web/src/flasher';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private connectedPort: SerialPort | null = null;

  async selectSerialPort(): Promise<void> {
    this.connectedPort = await navigator.serial.requestPort();
    console.log(this.connectedPort.getInfo());
  }

  get port(): SerialPort | null {
    return this.connectedPort;
  }

  private samba: SamBA | null = null;
  private serialPort: SerialPort | null = null;
  private device: Device | null = null;
  private isInBootloader: boolean = false;
  private observer: FlasherObserver = {
    onStatus: (message: string) => {
      console.log(message);
    },
    onProgress: (num: number, div: number) => {
      console.log(num + ' / ' + div);
    },
  };

  // Ordering is;
  // first connect device this.connectDevice();

  async performFlash(firmwareImage: Uint8Array) {
    if(!this.device) {
      throw new Error('device not connected');
    }

    let success = await this.flashImage(firmwareImage);

    if (success && this.device) {
      try {
        await this.device.reset();
      } catch (error) {}
    }
  }

  private async flashImage(data: Uint8Array): Promise<boolean> {
    if (this.device && this.samba && this.device.flash) {
      try {
        var flasher = new Flasher(this.samba, this.device.flash, this.observer);
        let offset = 0x10000;

        await flasher.erase(offset);
        await flasher.write(data, offset);

        return true;
      } catch (error) {}
    }

    return false;
  }

  // reset connection and enter bootloader
  async enterBootloader() {
    let rebootWaitMs = 1000;

    if (this.serialPort) {
      let serialPort = this.serialPort;
      console.info('Entering bootloader mode');

      await this.closePort();

      // Enter bootloader mode
      try {
        await serialPort.open({
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
          bufferSize: 63,
          flowControl: 'hardware',
          baudRate: 1200,
        });
        await sleep(50);
      } finally {
        await this.closePort();
        await sleep(rebootWaitMs);

        console.info(
          'Device should have rebooted by now. Starting re-connection',
        );
      }

      await this.connectDevice();
    }
  }

  async connectDevice() {
    const filters: SerialPortFilter[] = [
      {
        usbVendorId: 0x2341,
        usbProductId: 0x8054,
      },

      {
        usbVendorId: 0x2341,
        usbProductId: 0x0054,
      },
    ];

    navigator.serial
      .requestPort({ filters: filters })
      .then(async (port) => {
        await this.attachPort(port);
      })
      .catch((reason) => {});
  }

  private async attachPort(serialPort: SerialPort) {
    this.isInBootloader = false;

    let info = serialPort.getInfo();

    // Are we already in the bootloader?
    if ((info.usbVendorId = 0x2341) && info.usbProductId == 0x0054) {
      await this.connectBootloader(serialPort);
      return;
    }

    if ((info.usbVendorId = 0x2341) && info.usbProductId == 0x8054) {
      // Enter bootloader mode
      serialPort.open({
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 63,
        flowControl: 'hardware',
        baudRate: 921600,
      });
      await sleep(50);

      this.serialPort = serialPort;
    }
  }

  async closePort() {
    if (this.serialPort) {
      await this.serialPort.close();
    }
  }

  async connectBootloader(serialPort: SerialPort) {
    this.samba = new SamBA(serialPort, {
      logger: console,
      debug: true,
    });

    this.serialPort = serialPort;
    let theSamba = this.samba;
    await theSamba.connect(1000);

    var dev = new Device(theSamba);
    await dev.create();

    this.device = dev;

    this.isInBootloader = true;
  }
}
