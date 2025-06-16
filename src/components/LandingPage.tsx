import { Component } from "solid-js";

import { useDevice } from "@/contexts/DeviceContext";

const LandingPage: Component = () => {
  const { connectDevice } = useDevice();

  return (
    <div class="flex min-h-screen flex-col items-center justify-center bg-stone-900 p-4 text-white">
      <div class="w-full max-w-lg space-y-8 rounded-xl bg-stone-800 p-8 text-center shadow-xl">
        <h1 class="mb-6 text-4xl font-bold">Analog-type</h1>

        <p class="mb-4 text-lg text-pretty">
          Connect a <b>Wooting keyboard</b> to start typing!
        </p>
        <p class="mb-8 text-sm">
          Make sure you use a browser compatible with the{" "}
          <a
            class="underline"
            target="_blank"
            href="https://developer.mozilla.org/en-US/docs/Web/API/WebHID_API#browser_compatibility"
          >
            WebHID API
          </a>
          {". "}
          <span class="text-stone-400">(Chrome 89+, Edge 89+, Opera 75+)</span>
        </p>

        <button
          onClick={connectDevice}
          class="bg-primary hover:bg-primary/75 w-full cursor-pointer rounded-xl px-6 py-3 font-bold text-white transition-colors duration-200 ease-in-out hover:transition-colors"
        >
          Connect
        </button>

        <p class="text-xs text-stone-500">
          Built for a Wooting gamejam in a single day.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
