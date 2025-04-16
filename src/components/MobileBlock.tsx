import { Portal } from "solid-js/web";

export default function MobileBlock() {
  return (
    <Portal>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg select-none lg:hidden">
        <div class="mx-4 w-fit max-w-sm rounded-xl bg-stone-800 p-8 shadow-xl">
          <h2 class="mb-4 text-2xl font-bold text-white">{":("}</h2>
          <p class="mb-6 text-pretty text-stone-300">
            Unfortunately mobile devices are not supported. Please visit on a
            desktop computer.
          </p>
        </div>
      </div>
    </Portal>
  );
}
