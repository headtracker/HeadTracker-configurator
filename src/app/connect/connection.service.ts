import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private connectedPort: SerialPort | null = null;

  private serialPortFilters: SerialPortFilter[] = [
    // first is the nano 33 ble in program mode
    {
      usbVendorId: 0x2341,
      usbProductId: 0x805a,
    },
    // this is nano 33 ble in bootloader mode
    {
      usbVendorId: 0x2341,
      usbProductId: 0x005a,
    },
  ];

  async preloadPort(): Promise<void> {
    const ports = await navigator.serial.getPorts();
    const goodPorts = ports.filter((port) => {
      return this.serialPortFilters.some((filter) => {
        return port.getInfo().usbVendorId == filter.usbVendorId && port.getInfo().usbProductId == filter.usbProductId;
      });
    });
    // if we have already approved one of the ports from the list, use it, if more than one, use the first one;
    if (goodPorts.length > 0) {
      this.connectedPort = goodPorts[0];
    }
  }

  // Select the serial port I want to attach to
  async selectSerialPort(): Promise<void> {
    this.connectedPort = await navigator.serial.requestPort({
      filters: this.serialPortFilters,
    });

    console.debug('Port selected, info: %0', this.connectedPort.getInfo());
  }

  get port(): SerialPort | null {
    return this.connectedPort;
  }

  set port(port: SerialPort | null) {
    this.connectedPort = port;
  }
}
