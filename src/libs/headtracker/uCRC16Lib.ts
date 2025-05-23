/**
 * Tiny and cross-device compatible CCITT CRC16 calculator library - uCRC16Lib
 *
 * @version 2.0.0
 * @created 2018-04-21
 */

export class uCRC16Lib {
  private static readonly POLYNOMIAL: number = 0x8408;

  constructor() {
    // Nothing to do here
  }

  public static calculateFromString(data: string): number {
    const data_p: Uint8Array = new TextEncoder().encode(data);
    return this.calculate(data_p, data_p.length);
  }
  /**
   * Calculate CRC16 function
   *
   * @param data_p Pointer to data
   * @param length Length, in bytes, of data to calculate CRC16 of.
   * @returns Calculated CRC16 value
   */
  public static calculate(data_p: Uint8Array, length: number): number {
    let i: number;
    let data: number;
    let crc: number = 0xffff;

    if (length === 0) {
      return ~crc;
    }

    let index = 0;
    do {
      data = data_p[index++] & 0xff;
      for (i = 0; i < 8; i++, data >>= 1) {
        if ((crc & 0x0001) ^ (data & 0x0001)) {
          crc = (crc >> 1) ^ uCRC16Lib.POLYNOMIAL;
        } else {
          crc >>= 1;
        }
      }
    } while (--length);

    crc = ~crc;
    // Byte swap only needed in certain cases (i.e.: line transmission), so don't perform it.
    // data = crc;
    // crc = (crc << 8) | (data >> 8 & 0xFF);
    return crc;
  }

  public static escapeCRC(crc: any) {
    // Characters to escape out
    let crclow = crc & 0xFF;
    let crchigh = (crc >> 8) & 0xFF;

    if (crclow === 0x00 || crclow === 0x02 || crclow === 0x03 || crclow === 0x06 || crclow === 0x15) {
      crclow ^= 0xFF;
    }

    if (crchigh === 0x00 || crchigh === 0x02 || crchigh === 0x03 || crchigh === 0x06 || crchigh === 0x15) {
      crchigh ^= 0xFF;
    }

    return (crclow | (crchigh << 8)) >>> 0; // Ensure the result is treated as an unsigned 16-bit integer
  }
}
