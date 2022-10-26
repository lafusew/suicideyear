export enum Frequencies {
  ALL = 'ALL',
  BASS = 'BASS',
  MID = 'MID',
  HIGH = 'HIGH',
}

export type FREQUENCIES = keyof typeof Frequencies;