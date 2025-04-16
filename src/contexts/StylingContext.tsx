import { createContext, createSignal, useContext, JSX } from "solid-js";

interface StylingContextType {
  // Keyboard visualizer visibility
  showKeyboardVisualizer: () => boolean;
  setShowKeyboardVisualizer: (show: boolean) => void;

  // Add more styling options here as needed
}

const StylingContext = createContext<StylingContextType>(
  {} as StylingContextType
);

export function StylingProvider(props: { children: JSX.Element }) {
  const [showKeyboardVisualizer, setShowKeyboardVisualizer] =
    createSignal(true);

  const contextValue: StylingContextType = {
    showKeyboardVisualizer,
    setShowKeyboardVisualizer,
  };

  return (
    <StylingContext.Provider value={contextValue}>
      {props.children}
    </StylingContext.Provider>
  );
}

// Hook to use the context
export function useStyling() {
  const context = useContext(StylingContext);
  if (!context) {
    throw new Error("useStyling must be used within a StylingProvider");
  }
  return context;
}
