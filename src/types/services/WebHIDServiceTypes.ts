export interface AnalogReport {
  data: { key: number; value: number }[];
}

export interface HIDInputReportEvent extends Event {
  device: HIDDevice;
  reportId: number;
  data: {
    getUint8(index: number): number;
    getUint16(index: number): number;
    byteLength: number;
  };
}
