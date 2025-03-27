import { Flash, FlashEraseError, FlashPageError } from './flash';

import { SamBA } from './samba';

export class NullFlash extends Flash {
  protected _eraseAuto: boolean;

  constructor(samba: SamBA, name: string, pages: number, size: number, user: number, stack: number) {
    super(samba, name, 0, pages, size, 1, 0, user, stack);

    this._eraseAuto = false;
  }

  protected async erase(offset: number, size: number): Promise<void> {
    throw new FlashEraseError();
  }

  async eraseAll(offset: number): Promise<void> {
    // Use the extended Samba command if available
    if (this._samba.canChipErase) {
      await this._samba.chipErase(offset);
    } else {
      await this.erase(offset, this.totalSize - offset);
    }
  }

  public set eraseAuto(enable: boolean) {
    this._eraseAuto = enable;
  }

  public get eraseAuto(): boolean {
    return this._eraseAuto;
  }

  async getLockRegions(): Promise<Array<boolean>> {
    return [false];
  }

  async getSecurity(): Promise<boolean> {
    return false;
  }

  async getBod(): Promise<boolean> {
    return false;
  }

  canBod(): boolean {
    return false;
  }

  async getBor(): Promise<boolean> {
    return false;
  }

  canBor(): boolean {
    return false;
  }

  getBootFlash(): boolean {
    return true;
  }

  canBootFlash(): boolean {
    return false;
  }

  async writeOptions(): Promise<void> {
    return;
  }

  async writePage(page: number): Promise<void> {
    throw new FlashPageError();
  }

  // async waitReady(): Promise<void> {
  //   while (((await this.readReg(NVM_REG_INTFLAG)) & 0x1) == 0);
  // }

  async readPage(page: number, buf: Uint8Array): Promise<void> {
    if (page >= this._pages) {
      throw new FlashPageError();
    }

    await this._samba.read(this._addr + page * this._size, buf, this._size);
  }

  // async readReg(reg: number): Promise<number> {
  //   return await this._samba.readWord(NVM_REG_BASE + reg);
  // }

  // async writeReg(reg: number, value: number): Promise<void> {
  //   await this._samba.writeWord(NVM_REG_BASE + reg, value);
  // }

  // async command(cmd: number): Promise<void> {
  //   await this.waitReady();
  //
  //   await this.writeReg(NVM_REG_CTRLA, CMDEX_KEY | cmd);
  //
  //   await this.waitReady();
  //
  //   if ((await this.readReg(NVM_REG_INTFLAG)) & 0x2) {
  //     // Clear the error bit
  //     await this.writeReg(NVM_REG_INTFLAG, 0x2);
  //     throw new FlashCmdError();
  //   }
  // }

  override async writeBuffer(dst_addr: number, size: number): Promise<void> {
    // Auto-erase if enabled
    if (this.eraseAuto) await this.erase(dst_addr, size);

    // Call the base class method
    await super.writeBuffer(dst_addr, size);
  }
}
