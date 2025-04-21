export namespace Messages {
  export interface FW {
    Cmd: 'FW';
    Vers: string;
    Hard: string;
    Git: string;
  }

  export interface Data {
    Cmd: 'Data';
    panout: number;
    tiltout: number;
    rollout: number;
    panoff: number;
    tiltoff: number;
    rolloff: number;
    btaddr?: string;
    btcon?: boolean;
    btrmt?: string;
    ['6btaddrchr']?: string;
    ['6btrmtchr']?: string;
    gyrocal?: boolean;
    chout?: number;
    ['6choutu16']: string;
    btch?: number;
    ['6btchu8']: string;
    ppmch?: number;
    ['6ppmchu16']: string;
    uartch?: number;
    ['6uartchu16']: string;
  }

  export interface Get {
    Cmd: "Set";
    rll_min: number;
    rll_max: number;
    rll_cnt: number;
    rll_gain: number;
    tlt_min: number;
    tlt_max: number;
    tlt_cnt: number;
    tlt_gain: number;
    pan_min: number;
    pan_max: number;
    pan_cnt: number;
    pan_gain: number;
    tltch: number;
    rllch: number;
    panch: number;
    alertch: number;
    pwm0: number;
    pwm1: number;
    pwm2: number;
    pwm3: number;
    an0ch: number;
    an1ch: number;
    an2ch: number;
    an3ch: number;
    aux0ch: number;
    aux1ch: number;
    aux2ch: number;
    rstppm: number;
    aux0func: number;
    aux1func: number;
    aux2func: number;
    an0gain: number;
    an1gain: number;
    an2gain: number;
    an3gain: number;
    an0off: number;
    an1off: number;
    an2off: number;
    an3off: number;
    servoreverse: number;
    magxoff: number;
    magyoff: number;
    magzoff: number;
    accxoff: number;
    accyoff: number;
    acczoff: number;
    gyrxoff: number;
    gyryoff: number;
    gyrzoff: number;
    so00: number;
    so01: number;
    so02: number;
    so10: number;
    so11: number;
    so12: number;
    so20: number;
    so21: number;
    so22: number;
    dismag: boolean;
    rotx: number;
    roty: number;
    rotz: number;
    uartmode: number;
    crsftxrate: number;
    sbustxrate: number;
    sbininv: boolean;
    sboutinv: boolean;
    crsftxinv: boolean;
    ch5arm: boolean;
    btmode: number;
    rstonwave: boolean;
    buttonpin: number;
    butlngps: boolean;
    rstontlt: boolean;
    rstondblttap: boolean;
    rstondbltapthres: number;
    rstondbltapmin: number;
    rstondbltapmax: number;
    ppmoutinvert: boolean;
    ppmininvert: boolean;
    ppmframe: number;
    ppmsync: number;
    ppmchcnt: number;
    btpairedaddress: string;
    ppmoutpin: number;
    ppminpin: number;
  }

  export enum Feature {
    Magnetometer = "MAG",
    IMU = "IMU",
    ProximitySensor = "PROXIMITY",
    CenterButton = "CENTER",
    PPMInput = "PPMIN",
    PPMOutput = "PPMOUT",
    PWM4Channel = "PWM4CH",
    Analog4Channel = "AN4CH",
    AuxiliarySerial = "AUXSERIAL",
    LED = "LED",
    RGB = "RGB",
    Bluetooth = "BT",
    BluetoothJoystick = "BTJOYSTICK",
    Joystick = "JOYSTICK",
  }

  export interface FE {
    Cmd: "FE";
    FEAT: Feature[];
    PINS: {
      AN0: string;
      AN1: string;
      AN2: string;
      AN3: string;
      APDSINT: string;
      BMI270INT1: string;
      BMI270INT2: string;
      CENTER_BTN: string;
      D2: string;
      D4: string;
      D7: string;
      D8: string;
      D11: string;
      D12: string;
      I2C_PU: string;
      LED: string;
      LEDB: string;
      LEDG: string;
      LEDR: string;
      PPMIN: string;
      PPMOUT: string;
      PWM0: string;
      PWM1: string;
      PWM2: string;
      PWM3: string;
      PWR: string;
      RX: string
      RXINVI: string;
      RXINVO: string;
      TX: string;
      TXINV: string;
      VDDENA: string;
    }
  }
}
