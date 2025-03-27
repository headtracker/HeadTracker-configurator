import { Component, inject } from '@angular/core';
import { ConnectionService } from '@app/connect/connection.service';
import { MatButton } from '@angular/material/button';
import { NgForOf, NgIf } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Flasher, FlasherObserver } from '@bossa-web/src/flasher';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { SamBA } from '@bossa-web/src/samba';
import { Device } from '@bossa-web/src/device';
import { sleep } from '@bossa-web/src/util';

@Component({
  selector: 'app-firmware',
  standalone: true,
  imports: [MatButton, NgIf, MatProgressBar, NgForOf, MatProgressSpinner, MatIcon],
  templateUrl: './firmware.component.html',
})
export class FirmwareComponent {
  readonly connectionService: ConnectionService = inject(ConnectionService);

  private samba: SamBA | null = null;
  private device: Device | null = null;
  private isInBootloader: boolean = false;

  protected firmwareImage?: Uint8Array;
  protected filename?: string;
  protected fileSize?: number;

  protected totalPages: number | undefined;
  protected uploadedPages: number | undefined;
  protected statusMessages: string[] = [];
  protected flashingInProgress: boolean = false;
  protected flashingComplete: boolean = false;

  async selectFirmwareFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const arrayBuffer = await file.arrayBuffer();

      this.firmwareImage = new Uint8Array(arrayBuffer);
      this.filename = file.name;
      this.fileSize = this.firmwareImage.length;
    }
  }

  async flashFirmware(): Promise<void> {
    const observer: FlasherObserver = {
      onStatus: (message: string) => {
        this.statusMessages.push(message);
      },
      onProgress: (num: number, div: number) => {
        this.uploadedPages = num;
        this.totalPages = div;
      },
    };

    if (this.firmwareImage && this.connectionService.port) {
      this.flashingInProgress = true;
      this.flashingComplete = false;
      this.uploadedPages = 0;
      this.statusMessages = [];
      // Connect the device first
      try {
        this.statusMessages.push('Connecting to device');
        await this.connectDevice();
      } catch (e) {
        this.statusMessages.push(`Failed to connect to device: ${e}`);
        this.flashingInProgress = false;
        return;
      }

      // Get the name of the bootloader
      let bootloaderVersion = await this.getBootloaderVersion();
      this.statusMessages.push(`Bootloader version: ${bootloaderVersion}`);

      try {
        await this.performFlash(this.firmwareImage, observer);
        this.statusMessages.push(`Flashing complete`);
      } catch (e) {
        this.statusMessages.push(`Flashing failed: ${e}`);
      } finally {
        this.flashingInProgress = false;
        this.flashingComplete = true;
      }
    }
  }

  get canFlash(): boolean {
    return this.firmwareImage !== undefined && this.connectionService.port !== null;
  }

  // Get the bootloader version with the samba 'V' command
  private async getBootloaderVersion(): Promise<string> {
    if (this.samba) {
      return await this.samba.readVersion();
    }
    return 'Unknown device';
  }

  private async performFlash(firmwareImage: Uint8Array, observer: FlasherObserver) {
    if (!this.device) {
      throw new Error('device not connected');
    }

    let success = await this.flashImage(firmwareImage, observer);

    if (success && this.device) {
      try {
        await this.device.reset();
        const ports = await navigator.serial.getPorts();
        // go back to the program port
        const programPort = ports.find(
          (port) => port.getInfo().usbVendorId == 0x2341 && port.getInfo().usbProductId == 0x805a,
        );
        if (programPort) {
          this.connectionService.port = programPort;
        }
      } catch (error) {}
    }
  }

  private async flashImage(data: Uint8Array, observer: FlasherObserver): Promise<boolean> {
    if (this.device && this.samba && this.device.flash) {
      try {
        var flasher = new Flasher(this.samba, this.device.flash, observer);
        let offset = 0x0;

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

    if (this.connectionService.port) {
      let serialPort = this.connectionService.port;
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

        console.info('Device should have rebooted by now. Starting re-connection');
      }

      const ports = await navigator.serial.getPorts();
      // if we have already approved the bootloader port;
      const bootloaderPort = ports.find(
        (port) => port.getInfo().usbVendorId == 0x2341 && port.getInfo().usbProductId == 0x005a,
      );
      if (bootloaderPort) {
        this.connectionService.port = bootloaderPort;
      } else {
        await this.connectionService.selectSerialPort();
      }

      await this.connectDevice();
    }
  }

  async connectDevice() {
    if (this.connectionService.port === null) throw new Error('No port selected');
    await this.attachPort(this.connectionService.port);
  }

  private async attachPort(serialPort: SerialPort) {
    this.isInBootloader = false;

    let info = serialPort.getInfo();

    // Are we already in the bootloader?
    if (info.usbVendorId == 0x2341 && info.usbProductId == 0x005a) {
      await this.connectBootloader(serialPort);
      return;
    }

    if (info.usbVendorId == 0x2341 && info.usbProductId == 0x805a) {
      // Enter bootloader mode
      await this.enterBootloader();
    }
  }

  private async closePort() {
    if (this.connectionService.port) {
      try {
        await this.connectionService.port.close();
      } catch (error) {
        // port is already closed
        return;
      }
    }
  }

  private async connectBootloader(serialPort: SerialPort) {
    this.samba = new SamBA(serialPort, {
      logger: console,
      debug: true,
      trace: false,
    });

    this.connectionService.port = serialPort;
    let theSamba = this.samba;
    await theSamba.connect(1000);

    var dev = new Device(theSamba);
    await dev.create();

    this.device = dev;

    this.isInBootloader = true;
  }
}
