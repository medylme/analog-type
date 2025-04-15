import { createContext, createSignal, useContext, JSX } from "solid-js";
import { webHIDService } from "../services/WebHIDService";

interface DeviceContextType {
  isConnected: () => boolean;
  device: () => HIDDevice | null;
  connectDevice: () => Promise<void>;
  disconnectDevice: () => Promise<void>;
}

const DeviceContext = createContext<DeviceContextType>({
  isConnected: () => false,
  device: () => null,
  connectDevice: async () => {},
  disconnectDevice: async () => {},
});

export function DeviceProvider(props: { children: JSX.Element }) {
  const [device, setDevice] = createSignal<HIDDevice | null>(null);
  const [isConnected, setIsConnected] = createSignal(false);

  const connectDevice = async () => {
    try {
      const connectedDevice = await webHIDService.requestDevice();
      if (connectedDevice) {
        setDevice(connectedDevice);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error connecting to device:", error);
    }
  };

  const disconnectDevice = async () => {
    try {
      await webHIDService.disconnect();
      setDevice(null);
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting device:", error);
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        isConnected,
        device,
        connectDevice,
        disconnectDevice,
      }}
    >
      {props.children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  return useContext(DeviceContext);
}
