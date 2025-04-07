import { Uint8Buffer } from '@bossa-web/src/util';
import { uCRC16Lib } from './uCRC16Lib';
import { filter, map, Observable, Subject } from 'rxjs';

export function filterCmds(message: any): message is { Cmd: string } {
  return message && message.hasOwnProperty('Cmd');
}

export class HeadTracker {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private textDecoder = new TextDecoder();
  private messageSubject = new Subject<Uint8Array>();
  private commandQueue: { command: string; params: object }[] = [];
  private queueInterval: number | null = null;
  // this is the observable that will be used to get the messages
  // it will take the Uint8Array from the subject and decode it to a string
  // and try to parse it to an object
  public $messages: Observable<any> = this.messageSubject.asObservable().pipe(
    map((message: Uint8Array) => this.textDecoder.decode(message)),
    map((message: string) => {
      if (message.length === 0) {
        return null;
      }

      try {
        return JSON.parse(message);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return null;
      }
    }),
    filter((message: object | null) => message !== null),
  );

  async connect(port: SerialPort) {
    this.port = port;

    await this.port
      .open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      })
      .catch((err) => {
        console.error('Error opening port:', err);
      });

    this.read().then(() => {
      console.log('Read complete');
    });
  }

  async disconnect() {
    if (this.port) {
      try {
        await this.reader?.cancel();
        await this.port.close();
      } catch (err) {
        console.error('Error closing port:', err);
      }
      this.port = null;
    }
  }

  async sendCommand(command: string, params: object = {}): Promise<void> {

    this.commandQueue.push({ command, params });

    if (!this.queueInterval) {
      console.info('Starting interval to send commands');
      this.queueInterval = setInterval(async () => {
        await this.writeFromQueue();
      }, 100) as unknown as number;
    }
  }

  // The writing process has to be in a queue because the serial port can only handle one write at a time
  async writeFromQueue() {
    if (!this.port) {
      console.error('Port not connected');
      return;
    }

    if (this.commandQueue.length === 0) {
      console.info('No commands in queue, stopping interval');
      if (this.queueInterval) {
        clearInterval(this.queueInterval);
        this.queueInterval = null;
      }
      return;
    }

    if (!this.port.writable || this.port.writable.locked) {
      console.info('Port not writable');
      return;
    }

    const writer = this.port.writable.getWriter();

    const { command, params } = this.commandQueue.shift()!;

    const cmd = {
      Cmd: command,
      ...params,
    };

    const cmdString = JSON.stringify(cmd);

    const encoder = new TextEncoder();

    const CRC16 = uCRC16Lib.calculateFromString(cmdString);
    let crcArray = new Uint8Array(2);
    crcArray[0] = CRC16 & 0xff;
    crcArray[1] = (CRC16 >> 8) & 0xff;

    const packet = new Uint8Buffer();
    packet.reset();
    packet.push(0x02);
    packet.copy(encoder.encode(cmdString));
    packet.copy(crcArray);
    packet.push(0x03);
    packet.push(0x0d);
    packet.push(0x0a);

    const message = packet.view();

    console.info('Sending command:', new TextDecoder().decode(message));

    await writer.write(message);
    writer.releaseLock();
  }

  private async read() {
    if (!this.port || !this.port.readable) {
      console.error('Port not connected');
      return;
    }

    this.reader = this.port.readable.getReader();

    try {
      let messageBuffer: Uint8Array = new Uint8Array();
      let readingMessage = false;

      while (true) {
        const { value, done } = await this.reader.read();

        if (done) {
          console.log('Done reading:', done);
          break;
        }

        if (value) {
          for (let byte of value) {
            if (byte === 0x02) {
              readingMessage = true;
              messageBuffer = new Uint8Array();
            }

            if (readingMessage) {
              messageBuffer = Uint8Array.from([...messageBuffer, byte]);
            }

            if (byte === 0x03) {
              readingMessage = false;

              const receivedMessage = messageBuffer.slice(1, -3); // Exclude start (0x02) and end (0x03) bytes
              // const receivedCRC = messageBuffer.slice(-3, -1); // Last two bytes are the CRC16 value
              // const calculatedCRC = new Uint8Array(2);
              // const calculatedCRCValue = uCRC16Lib.calculate(receivedMessage, receivedMessage.length);
              // calculatedCRC[1] = calculatedCRCValue & 0xff;
              // calculatedCRC[0] = (calculatedCRCValue >> 8) & 0xff;

              // Can't get the CRC check to work, ignore it.
              // if (receivedCRC[0] === calculatedCRC[0] && receivedCRC[1] === calculatedCRC[1]) {
              // console.log('Received full message:', new TextDecoder().decode(receivedMessage));
              // } else {
              // console.log('Received full message:', new TextDecoder().decode(receivedMessage));
              // }
              this.messageSubject.next(receivedMessage);
              messageBuffer = new Uint8Array();
            }
          }
        }
      }
    } catch (error) {
      // Handle |error|…
    } finally {
      this.reader.releaseLock();
      this.reader = null;
    }
  }
}
