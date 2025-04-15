import { Component } from "solid-js";
import { useDevice } from "../context/DeviceContext";

const LandingPage: Component = () => {
  const { connectDevice } = useDevice();

  return (
    <div class="flex min-h-screen flex-col items-center justify-center bg-stone-900 p-4 text-white">
      <div class="w-full max-w-md space-y-8 rounded-xl bg-stone-800 p-8 text-center shadow-xl">
        <h1 class="mb-6 text-4xl font-bold">Analog-ony</h1>

        <div class="mb-6">
          <img
            src="/logo.png"
            alt="Wooting Keyboard"
            class="mx-auto h-32 w-32"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <p class="mb-8 text-lg text-pretty">
          Please connect a <b>Wooting keyboard</b>.
        </p>

        <button
          onClick={connectDevice}
          class="bg-blurple w-full cursor-pointer rounded-lg px-6 py-3 font-bold text-white transition-colors duration-200 hover:bg-blue-600"
        >
          Connect
        </button>

        <p class="mt-4 text-sm text-gray-400">
          If you don't have a Wooting keyboard, this demo probably won't work
          properly.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
