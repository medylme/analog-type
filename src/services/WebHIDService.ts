import { WOOT_ANALOG_USAGE, WOOT_VID } from "@/constants/WebHIDConstants";
import { AnalogReport, HIDInputReportEvent } from "@/types/services/WebHIDServiceTypes";

class WebHIDService {
  private device: HIDDevice | null = null;
  private currentAnalogCallback: ((report: AnalogReport) => void) | null = null;

  constructor() {
    this.device = null;
    this.currentAnalogCallback = null;
  }

  async requestDevice(): Promise<HIDDevice | null> {
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [
          {
            vendorId: WOOT_VID,
            usagePage: WOOT_ANALOG_USAGE,
          },
        ],
      });

      if (devices.length > 0) {
        this.device = devices[0];
        await this.device.open();
        console.log("Device connected:", this.device);

        this.setupInputHandler();
        return this.device;
      }

      return null;
    } catch (error) {
      console.error("Error connecting to device:", error);
      return null;
    }
  }

  private setupInputHandler() {
    if (!this.device) return;

    // This is a workaround for when onanalogreport doesn't properly trigger
    this.device.addEventListener(
      "inputreport",
      (event: HIDInputReportEvent) => {
        // The data structure is that there are pairs of 2 bytes for the hid id and one byte for the analog value repeated over and over
        const data = event.data;
        const analogData = [];
        for (let i = 0; i < data.byteLength; i += 3) {
          const key = data.getUint16(i);
          const value = data.getUint8(i + 2) / 255;

          if (value === 0) {
            break;
          }
          analogData.push({
            key,
            value,
          });
        }

        // Try both methods to ensure the callback is triggered
        if (this.device && this.device.onanalogreport) {
          this.device.onanalogreport({ data: analogData });
        } else if (this.currentAnalogCallback) {
          // Use the stored callback if onanalogreport doesn't work
          this.currentAnalogCallback({ data: analogData });
        } else {
          console.warn("No analog report event listener available");
        }
      }
    );
  }

  setAnalogReportListener(callback: (report: AnalogReport) => void) {
    if (!this.device) {
      console.warn("Cannot set analog report listener: No device connected");
      return;
    }

    // Store the callback for the inputreport event handler
    this.currentAnalogCallback = callback;

    // Set the standard onanalogreport property
    this.device.onanalogreport = callback;
  }

  getDevice(): HIDDevice | null {
    return this.device;
  }

  isConnected(): boolean {
    return this.device !== null;
  }

  async disconnect() {
    if (this.device) {
      console.log("Disconnecting device:", this.device.productName);
      // Clear any listeners
      this.device.onanalogreport = undefined;
      this.currentAnalogCallback = null;
      await this.device.close();
      this.device = null;
    }
  }
}

export const webHIDService = new WebHIDService();
export default webHIDService;
