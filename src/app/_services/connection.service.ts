import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private connectedPort = new BehaviorSubject<SerialPort | null>(null);
  // Observable so i could see when a new port is connected.
  public $connectedPort = this.connectedPort.asObservable();
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

  constructor() {
    navigator.serial.addEventListener('connect', async (event) => {
      // if I have the board in program mode, connect that
      if (
        event.target instanceof SerialPort &&
        event.target.getInfo().usbVendorId == this.serialPortFilters[0].usbVendorId &&
        event.target.getInfo().usbProductId == this.serialPortFilters[0].usbProductId
      ) {
        this.port = event.target;
      } else {
        await this.preloadPort();
      }
    });
  }

  async preloadPort(): Promise<void> {
    const ports = await navigator.serial.getPorts();
    const goodPorts = ports.filter((port) => {
      return this.serialPortFilters.some((filter) => {
        return port.getInfo().usbVendorId == filter.usbVendorId && port.getInfo().usbProductId == filter.usbProductId;
      });
    });
    // if we have already approved one of the ports from the list, use it, if more than one, use the first one;
    if (goodPorts.length > 0) {
      this.port = goodPorts[0];
    }
  }

  // Select the serial port I want to attach to
  async selectSerialPort(): Promise<void> {
    this.port = await navigator.serial.requestPort({
      filters: this.serialPortFilters,
    });

    console.debug('Port selected, info: %0', this.port!.getInfo());
  }

  get port(): SerialPort | null {
    return this.connectedPort.getValue();
  }

  set port(port: SerialPort | null) {
    this.connectedPort.next(port);
    const listener = (event: Event) => {
      console.debug('Port disconnected, info: %0', event);
      this.connectedPort.next(null)
      port?.removeEventListener('disconnect', listener);
    };
    port?.addEventListener('disconnect', listener);
  }
}
