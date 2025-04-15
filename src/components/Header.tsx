import { Component, Show } from "solid-js";
import { useDevice } from "../context/DeviceContext";

const Header: Component = () => {
  const { isConnected, device, disconnectDevice } = useDevice();

  return (
    <header class="bg-stone-800 px-4 py-3 shadow-md">
      <div class="container mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <h1 class="text-xl font-bold text-white">Analog-ony</h1>
        </div>

        <Show when={isConnected()}>
          <div class="flex items-center">
            <div class="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
            <span class="mr-4 text-white">
              {device()?.productName || "Connected Device"}
            </span>
            <button
              onClick={disconnectDevice}
              class="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Disconnect
            </button>
          </div>
        </Show>
      </div>
    </header>
  );
};

export default Header;
