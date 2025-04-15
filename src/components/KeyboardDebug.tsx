import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { useDevice } from "../context/DeviceContext";
import { useKeyboard } from "../context/KeyboardContext";

const KeyboardDebug: Component = () => {
  const { isConnected, device } = useDevice();
  const { pressedKeys } = useKeyboard();
  const [logs, setLogs] = createSignal<string[]>([]);
  const [expanded, setExpanded] = createSignal(false);

  // Add to log with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().substr(11, 12);
    setLogs((prev) => [...prev.slice(-19), `${timestamp} - ${message}`]);
  };

  // Intercept console logs for debugging
  onMount(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      addLog(
        `LOG: ${args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
          .join(" ")}`
      );
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog(
        `WARN: ${args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
          .join(" ")}`
      );
    };

    console.error = (...args) => {
      originalError(...args);
      addLog(
        `ERROR: ${args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
          .join(" ")}`
      );
    };

    onCleanup(() => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    });

    // Initial status log
    addLog(
      `Initial connection: ${isConnected() ? "connected" : "disconnected"}`
    );
    if (isConnected()) {
      const dev = device();
      addLog(`Device: ${dev?.productName || "Unknown"}`);
    }
  });

  return (
    <div class="fixed bottom-0 right-0 bg-black/80 text-white text-xs p-2 max-w-md max-h-60 overflow-auto">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold">Keyboard Debug</h3>
        <div class="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded())}
            class="bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-xs"
          >
            {expanded() ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Connection status */}
      <div class="mb-2">
        <div class="flex items-center gap-2">
          <div
            class={`w-2 h-2 rounded-full ${
              isConnected() ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span>Device: {isConnected() ? "Connected" : "Disconnected"}</span>
        </div>

        <div class="mt-1">
          <span>Pressed Keys: {pressedKeys().length}</span>
          {pressedKeys().length > 0 && (
            <div class="ml-2">
              {pressedKeys().map((key) => (
                <span class="mr-2">
                  {key.name}({key.value.toFixed(2)})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logs */}
      {expanded() && (
        <div class="border-t border-gray-700 pt-2 mt-2">
          <div class="font-bold mb-1">Event Log:</div>
          <div class="space-y-1 max-h-40 overflow-y-auto">
            {logs().map((log) => (
              <div class="border-l-2 border-blue-500 pl-2">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyboardDebug;
