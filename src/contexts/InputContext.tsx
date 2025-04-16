import {
  createContext,
  createSignal,
  useContext,
  JSX,
  onMount,
  onCleanup,
  createEffect,
} from "solid-js";

import { useDevice } from "@/contexts/DeviceContext";
import { webHIDService } from "@/services/WebHIDService";
import { AnalogReport } from "@/types/services/WebHIDServiceTypes";
import { KeyData } from "@/types/context/InputContextTypes";
import { KEYBOARD_LAYOUT } from "@/constants/InputContextConstants";

interface KeyboardContextType {
  pressedKeys: () => KeyData[];
  keyboardLayout: KeyData[];
  getMostPressedKey: () => KeyData | null;
}

const InputContext = createContext<KeyboardContextType>({
  pressedKeys: () => [],
  keyboardLayout: KEYBOARD_LAYOUT,
  getMostPressedKey: () => null,
});

export function InputProvider(props: { children: JSX.Element }) {
  const { isConnected, device } = useDevice();
  const [pressedKeys, setPressedKeys] = createSignal<KeyData[]>([]);
  const keyboardLayout = [...KEYBOARD_LAYOUT];

  const handleAnalogReport = (report: AnalogReport) => {
    // Validate the report structure
    if (!report || !report.data || !Array.isArray(report.data)) {
      console.error("Invalid analog report structure:", report);
      return;
    }

    const updatedKeys = [...keyboardLayout];

    // Reset all key values to 0
    updatedKeys.forEach((key) => (key.value = 0));

    // Update values for pressed keys
    report.data.forEach(({ key: keyCode, value }) => {
      const keyToUpdate = updatedKeys.find((k) => k.code === keyCode);
      if (keyToUpdate) {
        keyToUpdate.value = value;
      } else {
        // Log unknown key codes in a more readable format
        console.warn(
          `Unknown key code: 0x${keyCode.toString(16)} (decimal: ${keyCode})`
        );
      }
    });

    // Only include keys with values > 0
    const newPressedKeys = updatedKeys.filter((key) => key.value > 0);
    setPressedKeys(newPressedKeys);
  };

  // Monitor connection status and set up listeners when connected
  createEffect(() => {
    const connected = isConnected();

    if (connected) {
      webHIDService.setAnalogReportListener(handleAnalogReport);
    } else {
      // Clear the pressed keys when disconnected
      setPressedKeys([]);
    }
  });

  onMount(() => {
    // Initial setup if already connected
    if (isConnected()) {
      webHIDService.setAnalogReportListener(handleAnalogReport);
    }
  });

  onCleanup(() => {
    // Clean up listener on unmount
    if (isConnected()) {
      webHIDService.setAnalogReportListener(() => {});
    }
  });

  // Get most pressed key
  const getMostPressedKey = () => {
    const keys = pressedKeys();
    if (keys.length === 0) return null;

    return keys.reduce(
      (prev, current) => (current.value > prev.value ? current : prev),
      keys[0]
    );
  };

  return (
    <InputContext.Provider
      value={{
        pressedKeys,
        keyboardLayout,
        getMostPressedKey,
      }}
    >
      {props.children}
    </InputContext.Provider>
  );
}

export function useKeyboard() {
  return useContext(InputContext);
}
