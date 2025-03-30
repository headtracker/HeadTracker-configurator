import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ConnectionService } from '@app/_services/connection.service';
import { NgIf } from '@angular/common';
import {  getUsbVendorById } from 'usb-vendor-ids';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatButton, NgIf],
  templateUrl: './footer.component.html',
  host: { class: 'fixed bottom-0 shadow-inner border bg-white p-4 w-full' },
})
export class FooterComponent {
  readonly connectionService: ConnectionService = inject(ConnectionService);

  async selectPort() {
    await this.connectionService.selectSerialPort();
  }

  getVendorName(id: number | undefined) {
    return id ? getUsbVendorById(id) : undefined;
  }
}
