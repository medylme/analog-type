import { Component } from "solid-js";
import { useDevice } from "../context/DeviceContext";

const LandingPage: Component = () => {
  const { connectDevice } = useDevice();

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-white p-4">
      <div class="max-w-md w-full text-center space-y-8 bg-stone-800 p-8 rounded-xl shadow-xl">
        <h1 class="text-4xl font-bold mb-6">Analog-ony</h1>

        <div class="mb-6">
          <img
            src="/logo.png"
            alt="Wooting Keyboard"
            class="w-32 h-32 mx-auto"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <p class="text-lg mb-8 text-pretty">
          Please connect a <b>Wooting keyboard</b>.
        </p>

        <button
          onClick={connectDevice}
          class="bg-blurple hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg w-full transition-colors duration-200 cursor-pointer"
        >
          Connect
        </button>

        <p class="text-sm text-gray-400 mt-4">
          If you don't have a Wooting keyboard, this demo probably won't work properly.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
