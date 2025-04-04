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

  }
}
