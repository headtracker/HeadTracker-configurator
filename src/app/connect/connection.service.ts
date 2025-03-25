import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
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
}
