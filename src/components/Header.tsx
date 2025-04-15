import { Component, Show } from "solid-js";
import { useDevice } from "../context/DeviceContext";

const Header: Component = () => {
  const { isConnected, device, disconnectDevice } = useDevice();

  return (
    <header class="bg-stone-800 shadow-md py-3 px-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <h1 class="text-xl font-bold text-white">Analog-ony</h1>
        </div>

        <Show when={isConnected()}>
          <div class="flex items-center">
            <div class="bg-green-500 w-2 h-2 rounded-full mr-2"></div>
            <span class="text-white mr-4">
              {device()?.productName || "Connected Device"}
            </span>
            <button
              onClick={disconnectDevice}
              class="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-md"
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
