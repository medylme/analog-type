import { Component } from "solid-js";
import { useTyping } from "../context/TypingContext";

const Timer: Component = () => {
  const { settings, remainingTime } = useTyping();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {settings().mode === "time" && remainingTime() !== null && (
        <div class="text-white text-xl font-bold text-center mb-4">
          Time: {formatTime(remainingTime())}
        </div>
      )}
    </>
  );
};

export default Timer; 