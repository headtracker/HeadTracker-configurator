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
  }
}
