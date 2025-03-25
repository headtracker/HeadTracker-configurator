import { Component, inject } from '@angular/core';
import { ConnectionService } from '@app/connect/connection.service';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-firmware',
  standalone: true,
  imports: [MatButton, NgIf],
  templateUrl: './firmware.component.html',
})
export class FirmwareComponent {
  readonly connectionService: ConnectionService = inject(ConnectionService);
  protected firmwareImage?: Uint8Array;
  protected filename?: string;
  protected fileSize?: number;

  async selectFirmware(): Promise<void> {
    const response = await fetch('/binaries/nano_33_ble_rev2.bin');
    const arrayBuffer = await response.arrayBuffer();

    this.firmwareImage = new Uint8Array(arrayBuffer);
    this.filename = 'nano_33_ble_rev2.bin';
    this.fileSize = this.firmwareImage.length;
  }

  async selectDevice(): Promise<void> {
    await this.connectionService.connectDevice();
  }

  async flashFirmware(): Promise<void> {
    if (this.firmwareImage) {
      await this.connectionService.performFlash(this.firmwareImage);
    }
  }
}
