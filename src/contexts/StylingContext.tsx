import {
  createContext,
  createSignal,
  useContext,
  JSX,
  onMount,
} from "solid-js";

interface StylingContextType {
  // Keyboard visualizer visibility
  showKeyboardVisualizer: () => boolean;
  setShowKeyboardVisualizer: (show: boolean) => void;

  // Primary color
  primaryColor: () => string;
  setPrimaryColor: (color: string) => void;
}

const StylingContext = createContext<StylingContextType>(
  {} as StylingContextType
);

export function StylingProvider(props: { children: JSX.Element }) {
  const [showKeyboardVisualizer, setShowKeyboardVisualizer] =
    createSignal(true);

  // Initialize primary color from localStorage or use default
  const [primaryColor, setPrimaryColor] = createSignal(
    localStorage.getItem("primaryColor") || "#969eff"
  );

  // Save to localStorage whenever primary color changes
  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem("primaryColor", color);
  };

  const contextValue: StylingContextType = {
    showKeyboardVisualizer,
    setShowKeyboardVisualizer,
    primaryColor,
    setPrimaryColor: handlePrimaryColorChange,
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
