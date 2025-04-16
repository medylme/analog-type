interface Navigator {
  hid: {
    requestDevice(options: {
      filters: Array<{ vendorId: number; usagePage: number }>;
    }): Promise<HIDDevice[]>;
  };
}

interface HIDDevice {
  open(): Promise<void>;
  close(): Promise<void>;
  addEventListener(type: string, listener: EventListener): void;
  onanalogreport: ((this: this, ev: any) => void) | undefined;
  manufacturerName?: string;
  productName?: string;
} 
