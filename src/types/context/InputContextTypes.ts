export interface KeyData {
  code: number;
  name: string;
  value: number;
  row: number;
  col: number;
  width?: number; // in grid units, default is 1
}
