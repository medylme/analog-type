import {
  createContext,
  createSignal,
  useContext,
  JSX,
  onMount,
  onCleanup,
  createEffect,
} from "solid-js";
import {
  webHIDService,
  AnalogReport,
  AnalogKey,
} from "../services/WebHIDService";
import { useDevice } from "./DeviceContext";

// Interface for key data shared across components
export interface KeyData {
  code: number;
  name: string;
  value: number;
  row: number;
  col: number;
  width?: number; // in grid units, default is 1
}

interface KeyboardContextType {
  pressedKeys: () => KeyData[];
  keyboardLayout: KeyData[];
  getMostPressedKey: () => KeyData | null;
}

const defaultKeyboardLayout: KeyData[] = [
  // Row 1: Function keys and numbers
  { code: AnalogKey.Escape, name: "ESC", row: 0, col: 0, value: 0 },
  { code: AnalogKey.F1, name: "F1", row: 0, col: 2, value: 0 },
  { code: AnalogKey.F2, name: "F2", row: 0, col: 3, value: 0 },
  { code: AnalogKey.F3, name: "F3", row: 0, col: 4, value: 0 },
  { code: AnalogKey.F4, name: "F4", row: 0, col: 5, value: 0 },
  { code: AnalogKey.F5, name: "F5", row: 0, col: 6, value: 0 },
  { code: AnalogKey.F6, name: "F6", row: 0, col: 7, value: 0 },
  { code: AnalogKey.F7, name: "F7", row: 0, col: 8, value: 0 },
  { code: AnalogKey.F8, name: "F8", row: 0, col: 9, value: 0 },
  { code: AnalogKey.F9, name: "F9", row: 0, col: 10, value: 0 },
  { code: AnalogKey.F10, name: "F10", row: 0, col: 11, value: 0 },
  { code: AnalogKey.F11, name: "F11", row: 0, col: 12, value: 0 },
  { code: AnalogKey.F12, name: "F12", row: 0, col: 13, value: 0 },

  // Row 2: Number row
  { code: AnalogKey.Grave, name: "`", row: 1, col: 0, value: 0 },
  { code: AnalogKey.One, name: "1", row: 1, col: 1, value: 0 },
  { code: AnalogKey.Two, name: "2", row: 1, col: 2, value: 0 },
  { code: AnalogKey.Three, name: "3", row: 1, col: 3, value: 0 },
  { code: AnalogKey.Four, name: "4", row: 1, col: 4, value: 0 },
  { code: AnalogKey.Five, name: "5", row: 1, col: 5, value: 0 },
  { code: AnalogKey.Six, name: "6", row: 1, col: 6, value: 0 },
  { code: AnalogKey.Seven, name: "7", row: 1, col: 7, value: 0 },
  { code: AnalogKey.Eight, name: "8", row: 1, col: 8, value: 0 },
  { code: AnalogKey.Nine, name: "9", row: 1, col: 9, value: 0 },
  { code: AnalogKey.Zero, name: "0", row: 1, col: 10, value: 0 },
  { code: AnalogKey.Minus, name: "-", row: 1, col: 11, value: 0 },
  { code: AnalogKey.Equal, name: "=", row: 1, col: 12, value: 0 },
  {
    code: AnalogKey.Backspace,
    name: "BKSP",
    row: 1,
    col: 13,
    width: 2,
    value: 0,
  },

  // Row 3: QWERTY row
  { code: AnalogKey.Tab, name: "TAB", row: 2, col: 0, width: 1.5, value: 0 },
  { code: AnalogKey.Q, name: "Q", row: 2, col: 1.5, value: 0 },
  { code: AnalogKey.W, name: "W", row: 2, col: 2.5, value: 0 },
  { code: AnalogKey.E, name: "E", row: 2, col: 3.5, value: 0 },
  { code: AnalogKey.R, name: "R", row: 2, col: 4.5, value: 0 },
  { code: AnalogKey.T, name: "T", row: 2, col: 5.5, value: 0 },
  { code: AnalogKey.Y, name: "Y", row: 2, col: 6.5, value: 0 },
  { code: AnalogKey.U, name: "U", row: 2, col: 7.5, value: 0 },
  { code: AnalogKey.I, name: "I", row: 2, col: 8.5, value: 0 },
  { code: AnalogKey.O, name: "O", row: 2, col: 9.5, value: 0 },
  { code: AnalogKey.P, name: "P", row: 2, col: 10.5, value: 0 },
  { code: AnalogKey.LeftBracket, name: "[", row: 2, col: 11.5, value: 0 },
  { code: AnalogKey.RightBracket, name: "]", row: 2, col: 12.5, value: 0 },
  {
    code: AnalogKey.Backslash,
    name: "\\",
    row: 2,
    col: 13.5,
    width: 1.5,
    value: 0,
  },

  // Row 4: ASDF row
  {
    code: AnalogKey.CapsLock,
    name: "CAPS",
    row: 3,
    col: 0,
    width: 1.75,
    value: 0,
  },
  { code: AnalogKey.A, name: "A", row: 3, col: 1.75, value: 0 },
  { code: AnalogKey.S, name: "S", row: 3, col: 2.75, value: 0 },
  { code: AnalogKey.D, name: "D", row: 3, col: 3.75, value: 0 },
  { code: AnalogKey.F, name: "F", row: 3, col: 4.75, value: 0 },
  { code: AnalogKey.G, name: "G", row: 3, col: 5.75, value: 0 },
  { code: AnalogKey.H, name: "H", row: 3, col: 6.75, value: 0 },
  { code: AnalogKey.J, name: "J", row: 3, col: 7.75, value: 0 },
  { code: AnalogKey.K, name: "K", row: 3, col: 8.75, value: 0 },
  { code: AnalogKey.L, name: "L", row: 3, col: 9.75, value: 0 },
  { code: AnalogKey.Semicolon, name: ";", row: 3, col: 10.75, value: 0 },
  { code: AnalogKey.Quote, name: "'", row: 3, col: 11.75, value: 0 },
  {
    code: AnalogKey.Enter,
    name: "ENTER",
    row: 3,
    col: 12.75,
    width: 2.25,
    value: 0,
  },

  // Row 5: ZXCV row
  {
    code: AnalogKey.LeftShift,
    name: "SHIFT",
    row: 4,
    col: 0,
    width: 2.25,
    value: 0,
  },
  { code: AnalogKey.Z, name: "Z", row: 4, col: 2.25, value: 0 },
  { code: AnalogKey.X, name: "X", row: 4, col: 3.25, value: 0 },
  { code: AnalogKey.C, name: "C", row: 4, col: 4.25, value: 0 },
  { code: AnalogKey.V, name: "V", row: 4, col: 5.25, value: 0 },
  { code: AnalogKey.B, name: "B", row: 4, col: 6.25, value: 0 },
  { code: AnalogKey.N, name: "N", row: 4, col: 7.25, value: 0 },
  { code: AnalogKey.M, name: "M", row: 4, col: 8.25, value: 0 },
  { code: AnalogKey.Comma, name: ",", row: 4, col: 9.25, value: 0 },
  { code: AnalogKey.Period, name: ".", row: 4, col: 10.25, value: 0 },
  { code: AnalogKey.Slash, name: "/", row: 4, col: 11.25, value: 0 },
  {
    code: AnalogKey.RightShift,
    name: "SHIFT",
    row: 4,
    col: 12.25,
    width: 2.75,
    value: 0,
  },

  // Row 6: Bottom row
  {
    code: AnalogKey.LeftControl,
    name: "CTRL",
    row: 5,
    col: 0,
    width: 1.25,
    value: 0,
  },
  {
    code: AnalogKey.LeftGUI,
    name: "WIN",
    row: 5,
    col: 1.25,
    width: 1.25,
    value: 0,
  },
  {
    code: AnalogKey.LeftAlt,
    name: "ALT",
    row: 5,
    col: 2.5,
    width: 1.25,
    value: 0,
  },
  {
    code: AnalogKey.Space,
    name: "SPACE",
    row: 5,
    col: 3.75,
    width: 6.25,
    value: 0,
  },
  {
    code: AnalogKey.RightAlt,
    name: "ALT",
    row: 5,
    col: 10,
    width: 1.25,
    value: 0,
  },
  {
    code: AnalogKey.RightGUI,
    name: "FN",
    row: 5,
    col: 11.25,
    width: 1.25,
    value: 0,
  },
  {
    code: AnalogKey.RightControl,
    name: "CTRL",
    row: 5,
    col: 12.5,
    width: 1.25,
    value: 0,
  },
];

const KeyboardContext = createContext<KeyboardContextType>({
  pressedKeys: () => [],
  keyboardLayout: defaultKeyboardLayout,
  getMostPressedKey: () => null,
});

export function KeyboardProvider(props: { children: JSX.Element }) {
  const { isConnected, device } = useDevice();
  const [pressedKeys, setPressedKeys] = createSignal<KeyData[]>([]);
  const keyboardLayout = [...defaultKeyboardLayout];

  const handleAnalogReport = (report: AnalogReport) => {
    // Validate the report structure
    if (!report || !report.data || !Array.isArray(report.data)) {
      console.error("Invalid analog report structure:", report);
      return;
    }

    console.log(
      `Handling report with ${report.data.length} keys:`,
      report.data
        .map((d) => `${d.key.toString(16)}:${d.value.toFixed(2)}`)
        .join(", ")
    );

    const updatedKeys = [...keyboardLayout];

    // Reset all key values to 0
    updatedKeys.forEach((key) => (key.value = 0));

    // Update values for pressed keys
    report.data.forEach(({ key: keyCode, value }) => {
      const keyToUpdate = updatedKeys.find((k) => k.code === keyCode);
      if (keyToUpdate) {
        keyToUpdate.value = value;
        console.log(`Updating key ${keyToUpdate.name} to ${value.toFixed(2)}`);
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

    if (newPressedKeys.length > 0) {
      console.log(
        `Current pressed keys: ${newPressedKeys.map((k) => `${k.name}(${k.value.toFixed(2)})`).join(", ")}`
      );
    }
  };

  // Monitor connection status and set up listeners when connected
  createEffect(() => {
    const connected = isConnected();
    console.log(
      `Connection state changed: ${connected ? "connected" : "disconnected"}`
    );

    if (connected) {
      console.log("Device connected, setting up analog report listener");
      webHIDService.setAnalogReportListener(handleAnalogReport);

      // Get device info
      const dev = device();
      if (dev) {
        console.log(`Connected to: ${dev.productName || "Unknown device"}`);
      }
    } else {
      console.log("Device disconnected, cleaning up");
      // Clear the pressed keys when disconnected
      setPressedKeys([]);
    }
  });

  onMount(() => {
    // Initial setup if already connected
    if (isConnected()) {
      console.log("Initially connected, setting up listener");
      webHIDService.setAnalogReportListener(handleAnalogReport);
    }
  });

  onCleanup(() => {
    // Clean up listener on unmount
    if (isConnected()) {
      console.log("Cleaning up analog report listener");
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
    <KeyboardContext.Provider
      value={{
        pressedKeys,
        keyboardLayout,
        getMostPressedKey,
      }}
    >
      {props.children}
    </KeyboardContext.Provider>
  );
}

export function useKeyboard() {
  return useContext(KeyboardContext);
}
