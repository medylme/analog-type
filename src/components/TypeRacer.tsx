import {
  Component,
  createSignal,
  onMount,
  createEffect,
  onCleanup,
} from "solid-js";
import { Transition } from "solid-transition-group";
import wordService from "../services/WordService";
import { useTyping } from "../context/TypingContext";
import { useKeyboard } from "../context/KeyboardContext";
import { useDevice } from "../context/DeviceContext";

type KeyActuationState = {
  isActuated: boolean;
  wasAboveMax: boolean;
  code: number;
  value: number;
};

const TypeRacer: Component = () => {
  const {
    settings,
    typingText,
    isTestComplete,
    updateMetrics,
    startTime,
    setStartTime,
    setRemainingTime,
    startCountdown,
    completeTest,
  } = useTyping();

  const { pressedKeys } = useKeyboard();
  const { isConnected } = useDevice();

  // Track actuation state of keys
  const [keyActuationStates, setKeyActuationStates] = createSignal<
    Record<number, KeyActuationState>
  >({});

  // Track last detected actuation to prevent duplicates
  const [lastActuatedKeys, setLastActuatedKeys] = createSignal<Set<number>>(
    new Set()
  );

  const [currentInput, setCurrentInput] = createSignal("");
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [cursorPosition, setCursorPosition] = createSignal({ left: 0, top: 0 });
  const [isTyping, setIsTyping] = createSignal(false);
  const [displayText, setDisplayText] = createSignal("");
  const [scrollOffset, setScrollOffset] = createSignal(0);
  const [nextGenerationPoint, setNextGenerationPoint] = createSignal(0);
  const [shouldAnimate, setShouldAnimate] = createSignal(true);
  const [isWindowFocused, setIsWindowFocused] = createSignal(true);

  let inputRef: HTMLInputElement | undefined;
  let textContainerRef: HTMLDivElement | undefined;
  let textDisplayRef: HTMLDivElement | undefined;
  let spanRefs: HTMLSpanElement[] = [];
  let typingTimer: number;
  let metricsTimer: number;
  let cursorUpdateRaf: number;
  let lineHeight = 0;

  // Process analog key inputs and handle actuation based on targetBracket settings
  createEffect(() => {
    // Ignore all input if window is not focused
    if (!isWindowFocused()) return;

    const currentKeys = pressedKeys();
    const targetBracket = settings().targetBracket;

    if (!targetBracket || currentKeys.length === 0) return;

    console.log(
      `Processing ${currentKeys.length} keys with targetBracket:`,
      targetBracket
    );

    let actuationsToTrigger: number[] = [];
    let lastActuated = lastActuatedKeys();

    // Handle each pressed key
    currentKeys.forEach((key) => {
      // Skip keys with very small values that might be noise
      if (key.value < 0.01) return;

      console.log(
        `Processing key: ${key.code.toString(16)} (${
          key.name
        }) with value: ${key.value.toFixed(2)}`
      );

      if (targetBracket.enabled) {
        // Get the current state for this key
        const keyState = keyActuationStates()[key.code];

        // If key is currently ignored because it went past max, check if it's been released
        if (keyState?.wasAboveMax && key.value < 0.05) {
          // Key has been released, remove ignore flag
          setKeyActuationStates((prev) => ({
            ...prev,
            [key.code]: {
              code: key.code,
              value: key.value,
              isActuated: false,
              wasAboveMax: false,
            },
          }));
          console.log(`Key ${key.code.toString(16)} reset after exceeding max`);
        }
        // If key wasn't above max, check normal actuation
        else if (!keyState?.wasAboveMax) {
          // Check if key has crossed the min threshold and hasn't been actuated yet
          if (key.value >= targetBracket.min && !lastActuated.has(key.code)) {
            // Actuate the key
            actuationsToTrigger.push(key.code);
            lastActuated.add(key.code);

            // Mark this key as actuated
            setKeyActuationStates((prev) => ({
              ...prev,
              [key.code]: {
                code: key.code,
                value: key.value,
                isActuated: true,
                wasAboveMax: false,
              },
            }));
            console.log(
              `Key ${key.code.toString(16)} triggered at ${key.value.toFixed(2)}`
            );
          }

          // Check if an actuated key has gone above max
          if (key.value > targetBracket.max && keyState?.isActuated) {
            // Key has gone past max, "undo" the actuation
            console.log(
              `Key ${key.code.toString(16)} exceeded max: ${key.value.toFixed(2)}, undoing actuation`
            );

            // Remove from actuated keys set
            setLastActuatedKeys((prev) => {
              const newSet = new Set(prev);
              newSet.delete(key.code);
              return newSet;
            });

            // Mark this key as having gone above max (to ignore until reset)
            setKeyActuationStates((prev) => ({
              ...prev,
              [key.code]: {
                code: key.code,
                value: key.value,
                isActuated: false,
                wasAboveMax: true,
              },
            }));

            // Trigger a backspace to undo this key's input
            triggerBackspace();
          }
        }
      } else {
        // ACTUATION POINT MODE (actuation on crossing threshold)
        // Check if key value crossed the actuation threshold and hasn't been actuated yet
        if (key.value >= targetBracket.min && !lastActuated.has(key.code)) {
          actuationsToTrigger.push(key.code);
          lastActuated.add(key.code);
          console.log(
            `Key ${key.code.toString(16)} (${
              key.name
            }) triggered at ${key.value.toFixed(2)}`
          );
        }
      }
    });

    // For bracket and actuation point modes, reset keys that have fallen below the threshold
    currentKeys.forEach((key) => {
      if (key.value < targetBracket.min && lastActuated.has(key.code)) {
        // Only reset keys that haven't gone past max
        if (!keyActuationStates()[key.code]?.wasAboveMax) {
          console.log(
            `Key ${key.code.toString(16)} (${
              key.name
            }) reset below threshold: ${key.value.toFixed(2)}`
          );
          setLastActuatedKeys((prev) => {
            const newSet = new Set(prev);
            newSet.delete(key.code);
            return newSet;
          });
        }
      }
    });

    // Also reset any keys not in the current report
    lastActuated.forEach((code) => {
      if (!currentKeys.some((k) => k.code === code)) {
        setLastActuatedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(code);
          return newSet;
        });
      }
    });

    // Trigger actuations
    if (actuationsToTrigger.length > 0) {
      console.log(
        `Actuating keys: ${actuationsToTrigger
          .map((code) => code.toString(16))
          .join(", ")}`
      );
      actuationsToTrigger.forEach((keyCode) => {
        triggerKeyInput(keyCode);
      });
    }
  });

  // Helper function to trigger a backspace
  const triggerBackspace = () => {
    if (isTestComplete()) return;
    if (currentIndex() === 0) return;
    if (isWordComplete(currentIndex() - 1)) return;

    const newInput = currentInput().substring(0, currentInput().length - 1);
    setCurrentInput(newInput);
    setCurrentIndex(newInput.length);

    // Update UI state
    setShouldAnimate(false);
    updateScrollPosition();

    setIsTyping(true);
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      setIsTyping(false);
      setShouldAnimate(true);
    }, 750);
  };

  // Trigger key input based on key code
  const triggerKeyInput = (keyCode: number) => {
    if (isTestComplete()) return;

    // Get character based on key code
    const char = getCharFromKeyCode(keyCode);
    console.log(
      `Triggering key input for code ${keyCode.toString(16)}: ${char}`
    );
    if (!char) return;

    // Special handling for backspace
    if (char === "Backspace") {
      if (currentIndex() === 0) return;
      if (isWordComplete(currentIndex() - 1)) return;

      const newInput = currentInput().substring(0, currentInput().length - 1);
      setCurrentInput(newInput);
      setCurrentIndex(newInput.length);
    } else if (char.length === 1) {
      // Regular character input
      const newInput = currentInput() + char;
      setCurrentInput(newInput);
      setCurrentIndex(newInput.length);

      if (startTime() === null) {
        setStartTime(Date.now());
        if (settings().mode === "time" && settings().timeSeconds) {
          setRemainingTime(settings().timeSeconds);
          startCountdown();
        }
      }
    }

    // Update UI state
    setShouldAnimate(false);
    updateScrollPosition();
    appendMoreTextIfNeeded();

    setIsTyping(true);
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      setIsTyping(false);
      setShouldAnimate(true);
    }, 750);

    // Check if test is completed in word count mode
    if (settings().mode === "words" && currentIndex() >= displayText().length) {
      completeTest();
    }
  };

  // Convert key code to character
  const getCharFromKeyCode = (keyCode: number): string | null => {
    // This is a simplified mapping - in a real implementation, you'd handle modifiers and more keys
    const keyMap: Record<number, string> = {
      0x04: "a",
      0x05: "b",
      0x06: "c",
      0x07: "d",
      0x08: "e",
      0x09: "f",
      0x0a: "g",
      0x0b: "h",
      0x0c: "i",
      0x0d: "j",
      0x0e: "k",
      0x0f: "l",
      0x10: "m",
      0x11: "n",
      0x12: "o",
      0x13: "p",
      0x14: "q",
      0x15: "r",
      0x16: "s",
      0x17: "t",
      0x18: "u",
      0x19: "v",
      0x1a: "w",
      0x1b: "x",
      0x1c: "y",
      0x1d: "z",
      0x1e: "1",
      0x1f: "2",
      0x20: "3",
      0x21: "4",
      0x22: "5",
      0x23: "6",
      0x24: "7",
      0x25: "8",
      0x26: "9",
      0x27: "0",
      0x2c: " ", // Space
      0x2a: "Backspace",
    };

    return keyMap[keyCode] || null;
  };

  // Lines management functions
  const getLineHeight = (): number => {
    if (lineHeight) return lineHeight;
    if (!textContainerRef) return 24; // default fallback

    // Get computed line height from the container
    const computedStyle = window.getComputedStyle(textContainerRef);
    lineHeight =
      parseInt(computedStyle.lineHeight) ||
      parseInt(computedStyle.fontSize) * 1.2;
    return lineHeight;
  };

  const getWordAtPosition = (
    text: string,
    position: number
  ): { start: number; end: number } => {
    let start = position;
    while (start > 0 && text[start - 1] !== " " && text[start - 1] !== "\n") {
      start--;
    }

    let end = position;
    while (end < text.length && text[end] !== " " && text[end] !== "\n") {
      end++;
    }

    return { start, end };
  };

  const getLineEndPosition = (text: string, position: number): number => {
    let end = position;
    while (end < text.length && text[end] !== "\n") {
      end++;
    }
    return end;
  };

  const calculateLinePositions = (): { lineStarts: number[] } => {
    if (!textDisplayRef) return { lineStarts: [] };

    const text = displayText();
    const lineStarts: number[] = [0];
    let currPos = 0;

    // This is an approximation - actual line breaks depend on text wrapping
    // Create a temporary span to measure text
    const measureSpan = document.createElement("span");
    measureSpan.style.visibility = "hidden";
    measureSpan.style.position = "absolute";
    measureSpan.style.whiteSpace = "pre-wrap";
    measureSpan.style.wordBreak = "break-word";
    measureSpan.style.width = textDisplayRef.clientWidth + "px";
    measureSpan.style.font = window.getComputedStyle(textDisplayRef).font;
    document.body.appendChild(measureSpan);

    // Process text to find line breaks based on container width
    while (currPos < text.length) {
      const lineEnd = getLineEndPosition(text, currPos);
      const lineText = text.substring(currPos, lineEnd);

      // Measure this text
      measureSpan.textContent = lineText;
      const textHeight = measureSpan.offsetHeight;
      const textLines = Math.round(textHeight / getLineHeight());

      // If this text wraps to multiple lines, we need to find approximate line breaks
      if (textLines > 1) {
        let approxCharsPerLine = Math.ceil(lineText.length / textLines);
        for (let i = 1; i < textLines; i++) {
          let breakPoint = currPos + i * approxCharsPerLine;
          if (breakPoint < lineEnd) {
            // Find a word boundary near this position
            const wordBoundary = getWordAtPosition(text, breakPoint);
            lineStarts.push(wordBoundary.start);
          }
        }
      }

      // Move to next line
      if (lineEnd < text.length) {
        currPos = lineEnd + 1;
        lineStarts.push(currPos);
      } else {
        break;
      }
    }

    document.body.removeChild(measureSpan);
    return { lineStarts };
  };

  const updateScrollPosition = () => {
    if (!textDisplayRef || !textContainerRef) return;

    const { lineStarts } = calculateLinePositions();
    const currentPos = currentIndex();
    let currentLineIndex = 0;

    // Find which line the cursor is currently on
    for (let i = lineStarts.length - 1; i >= 0; i--) {
      if (currentPos >= lineStarts[i]) {
        currentLineIndex = i;
        break;
      }
    }

    // We need to determine if we're at the end of the second line before scrolling
    if (currentLineIndex > 1) {
      // We're on the third line or beyond
      // Calculate how many lines we need to scroll up to keep the current line in view
      // but with one line of context above it
      const linesToScroll = Math.max(0, currentLineIndex - 1);

      // Update the scroll offset and the top visible line
      setScrollOffset(linesToScroll * getLineHeight());

      // Apply scroll
      if (textDisplayRef) {
        textDisplayRef.style.transform = `translateY(-${scrollOffset()}px)`;
      }
    } else if (currentLineIndex === 1) {
      // We're on the second line - check if we're at the end of a word near the end of the line
      // First, find where the third line starts
      const thirdLineStart =
        lineStarts.length > 2 ? lineStarts[2] : displayText().length;

      // Check if we're close to the third line start and just completed a word
      const isAtWordEnd =
        currentPos > 0 && displayText()[currentPos - 1] === " ";

      // Calculate how close we are to the start of the third line (as percentage of second line)
      const secondLineLength = thirdLineStart - lineStarts[1];
      const positionInSecondLine = currentPos - lineStarts[1];
      const percentageOfSecondLine = positionInSecondLine / secondLineLength;

      // Only scroll if we've completed a word and are at least 80% through the second line
      if (isAtWordEnd && percentageOfSecondLine >= 0.8) {
        // Start scrolling - set the offset to show part of the third line
        setScrollOffset(getLineHeight());

        if (textDisplayRef) {
          textDisplayRef.style.transform = `translateY(-${scrollOffset()}px)`;
        }
      }
    }
  };

  const appendMoreTextIfNeeded = () => {
    // Only append more text for timed mode
    if (settings().mode === "time" && currentIndex() > nextGenerationPoint()) {
      // Generate more text and append it
      const additionalText = wordService.appendMoreWords(50);
      setDisplayText(displayText() + " " + additionalText);
      setNextGenerationPoint(displayText().length * 0.75);
    }
  };

  // Effect to handle window resizing
  createEffect(() => {
    if (textContainerRef) {
      const observer = new ResizeObserver(() => {
        // Reset line height cache and recalculate
        lineHeight = 0;
        updateScrollPosition();
      });

      observer.observe(textContainerRef);

      onCleanup(() => {
        observer.disconnect();
      });
    }
  });

  // Reset component state (local to this component)
  const resetComponentState = () => {
    // Reset local state
    setCurrentInput("");
    setCurrentIndex(0);
    setScrollOffset(0);
    setIsTyping(false);
    setKeyActuationStates({});

    // Clear input field
    if (inputRef) {
      inputRef.value = "";
    }

    // Clear timers
    clearTimeout(typingTimer);

    // Reset text display
    if (textDisplayRef) {
      textDisplayRef.style.transform = `translateY(0px)`;
    }
  };

  // Effect to update display text when typing text changes
  createEffect(() => {
    // Get the text from context
    const text = typingText();

    if (settings().mode === "time") {
      setDisplayText(text);
    } else {
      // For word count mode, only display exactly the number of words needed
      const wordCount = settings().wordCount || 25;
      const words = text.split(" ").slice(0, wordCount);
      setDisplayText(words.join(" "));
    }

    // Set the next generation point for infinite text
    setNextGenerationPoint(text.length * 0.75);

    // Reset component state
    resetComponentState();
  });

  const updateCursorPosition = () => {
    if (!textContainerRef || !spanRefs[currentIndex()]) return;

    const rect = spanRefs[currentIndex()].getBoundingClientRect();
    const containerRect = textContainerRef.getBoundingClientRect();

    if (containerRect) {
      // Calculate visual cursor position, adjusting for scroll
      let cursorTop = rect.top - containerRect.top;

      // Determine which visual line the cursor is on (0-based)
      const lineHeight = getLineHeight();
      const visualLine = Math.floor(cursorTop / lineHeight);

      // Get total number of lines in current text
      const { lineStarts } = calculateLinePositions();
      const isLastLine =
        currentIndex() > 0 &&
        lineStarts.findIndex((start) => start > currentIndex()) === 1;

      // If we're not on the last line of text, keep cursor on second visible line
      if (visualLine >= 2 && !isLastLine) {
        // Adjust cursor to appear on the second line
        cursorTop = lineHeight * 1; // second line (0-indexed, so line 1)
      }

      // Update cursor position
      setCursorPosition({
        left: rect.left - containerRect.left,
        top: cursorTop,
      });
    }
  };

  createEffect(() => {
    // Cancel any existing animation frame
    if (cursorUpdateRaf) {
      cancelAnimationFrame(cursorUpdateRaf);
    }

    // Use requestAnimationFrame for smoother cursor updates
    cursorUpdateRaf = requestAnimationFrame(() => {
      updateCursorPosition();
    });
  });

  const calculateMetrics = () => {
    if (startTime() === null) return;

    const timeElapsed = (Date.now() - startTime()) / 1000 / 60; // in minutes
    if (timeElapsed <= 0) return;

    // Count correctly typed characters (including spaces)
    let correctChars = 0;

    // Count all correct characters typed so far, regardless of word completion
    for (let i = 0; i < currentIndex(); i++) {
      if (currentInput()[i] === displayText()[i]) {
        correctChars++;
      }
    }

    // Calculate WPM: (characters / 5) / time(minutes)
    const wpm = Math.round(correctChars / 5 / timeElapsed);

    // Calculate Raw WPM (includes all typed characters)
    const rawWpm = Math.round(currentIndex() / 5 / timeElapsed);

    // CPM (characters per minute)
    const cpm = Math.round(currentIndex() / timeElapsed);

    // Accuracy
    const accuracy =
      currentIndex() > 0
        ? Math.round((correctChars / currentIndex()) * 100)
        : 0;

    const newMetrics = { wpm, rawWpm, cpm, accuracy };

    // Send metrics update to context
    updateMetrics(newMetrics);
  };

  const isWordComplete = (index: number): boolean => {
    let wordStart = index;
    while (wordStart > 0 && displayText()[wordStart - 1] !== " ") {
      wordStart--;
    }

    for (let i = wordStart; i < index; i++) {
      if (currentInput()[i] !== displayText()[i]) {
        return false;
      }
    }

    return index === displayText().length || displayText()[index] === " ";
  };

  // Legacy key handler - keep for fallback keyboard access
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isTestComplete()) {
      e.preventDefault();
      return;
    }

    setIsTyping(true);
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      setIsTyping(false);
    }, 750);

    if (e.key === "Backspace") {
      if (currentIndex() === 0) {
        e.preventDefault();
        return;
      }

      if (isWordComplete(currentIndex() - 1)) {
        e.preventDefault();
        return;
      }
    }
  };

  const getCharClass = (index: number) => {
    if (index < currentIndex()) {
      return currentInput()[index] === displayText()[index]
        ? "text-green-500"
        : "text-red-500";
    }
    return "text-gray-400";
  };

  createEffect(() => {
    if (spanRefs[currentIndex()]) {
      const rect = spanRefs[currentIndex()].getBoundingClientRect();
      const containerRect = textContainerRef?.getBoundingClientRect();
      if (containerRect) {
        // Calculate visual cursor position, adjusting for scroll
        let cursorTop = rect.top - containerRect.top;

        // If the cursor would appear on the third line, adjust it to stay on second line
        // First line is at 0, second line is at 1 * lineHeight, etc.
        const lineHeight = getLineHeight();

        // Determine which visual line the cursor is on (0-based)
        const visualLine = Math.floor(cursorTop / lineHeight);

        // Get total number of lines in current text
        const { lineStarts } = calculateLinePositions();
        const isLastLine =
          currentIndex() > 0 &&
          lineStarts.findIndex((start) => start > currentIndex()) === 1;

        // If we're not on the last line of text, keep cursor on second visible line
        if (visualLine >= 2 && !isLastLine) {
          // Adjust cursor to appear on the second line
          cursorTop = lineHeight * 1; // second line (0-indexed, so line 1)
        }

        setCursorPosition({
          left: rect.left - containerRect.left,
          top: cursorTop,
        });
      }
    }
  });

  createEffect(() => {
    if (
      settings().mode === "words" &&
      currentIndex() === displayText().length
    ) {
      completeTest();
    }
  });

  // Legacy input handler - keep for fallback
  const handleInput = (e: Event) => {
    if (isTestComplete()) return;

    const input = (e.target as HTMLInputElement).value;
    setCurrentInput(input);
    setCurrentIndex(input.length);

    // Temporarily disable cursor animation during rapid typing
    setShouldAnimate(false);

    // Update scroll position as user types
    updateScrollPosition();

    // Check if we need to generate more text for timed mode
    appendMoreTextIfNeeded();

    if (startTime() === null) {
      setStartTime(Date.now());
      if (settings().mode === "time" && settings().timeSeconds) {
        setRemainingTime(settings().timeSeconds);
        startCountdown();
      }
    }

    setIsTyping(true);
    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
      setIsTyping(false);
      setShouldAnimate(true);
    }, 750);

    calculateMetrics();

    // Check if test is completed in word count mode
    if (settings().mode === "words" && currentIndex() >= displayText().length) {
      completeTest();
    }
  };

  onMount(() => {
    if (inputRef) {
      inputRef.focus();
      // Disable standard input handling - only use analog data
      inputRef.disabled = false; // We need the element to be enabled to receive focus
    }

    // Keep focus on the input element at all times
    const focusInterval = setInterval(() => {
      if (
        inputRef &&
        !isTestComplete() &&
        document.activeElement !== inputRef &&
        isWindowFocused()
      ) {
        console.log("Restoring focus to input element");
        inputRef.focus();
      }
    }, 300);

    // Ensure the window has focus for keyboard events
    window.focus();

    // Set up window focus/blur event handlers
    const handleWindowFocus = () => {
      console.log("Window gained focus");
      setIsWindowFocused(true);
    };

    const handleWindowBlur = () => {
      console.log("Window lost focus");
      setIsWindowFocused(false);
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    // Initial focus state
    setIsWindowFocused(document.hasFocus());

    console.log("TypeRacer component mounted");
    console.log("Target bracket settings:", settings().targetBracket);

    // Update metrics every second while typing
    metricsTimer = setInterval(() => {
      if (
        startTime() !== null &&
        currentIndex() > 0 &&
        currentIndex() < displayText().length &&
        !isTestComplete() &&
        isWindowFocused()
      ) {
        calculateMetrics();
      }
    }, 1000);

    onCleanup(() => {
      clearInterval(focusInterval);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    });
  });

  onCleanup(() => {
    clearInterval(metricsTimer);
    clearTimeout(typingTimer);
    if (cursorUpdateRaf) {
      cancelAnimationFrame(cursorUpdateRaf);
    }
  });

  return (
    <div
      class="type-racer-wrapper overflow-hidden"
      tabIndex={-1}
      onFocus={() => inputRef?.focus()}
      onBlur={() => setTimeout(() => inputRef?.focus(), 10)}
    >
      <Transition
        name="typeracer"
        enterActiveClass="transition-all duration-1000 ease-in-out"
        enterClass="opacity-0 transform"
        enterToClass="opacity-100 transform"
        exitActiveClass="transition-all duration-700 ease-in-out"
        exitClass="opacity-100 max-h-[300px] mb-0 overflow-hidden transform translate-y-0"
        exitToClass="opacity-0 max-h-0 mb-[-300px] overflow-hidden pointer-events-none transform -translate-y-10"
        appear={true}
      >
        {!isTestComplete() && (
          <div class="mx-auto max-w-2xl p-4">
            <div
              ref={textContainerRef}
              class="relative cursor-text font-mono text-2xl leading-relaxed"
              style="height: 7.5rem; overflow: hidden; white-space: pre-wrap; word-break: break-word;"
              onClick={() => {
                if (!isTestComplete() && inputRef) {
                  inputRef.focus();
                  window.focus();
                }
              }}
            >
              <div
                ref={textDisplayRef}
                class="transition-filter filter-transition transition-transform duration-200"
                style={{
                  transform: `translateY(-${scrollOffset()}px)`,
                  filter: isWindowFocused() ? "none" : "blur(4px)",
                }}
              >
                {displayText()
                  .split("")
                  .map((char, index) => (
                    <span
                      ref={(el) => (spanRefs[index] = el)}
                      class={`transition-colors duration-100 ${getCharClass(
                        index
                      )}`}
                    >
                      {char}
                    </span>
                  ))}
              </div>
              {!isTestComplete() && isWindowFocused() && (
                <div
                  class="bg-blurple absolute w-0.5 transition-all duration-100"
                  style={{
                    left: `${cursorPosition().left}px`,
                    top: `${cursorPosition().top}px`,
                    height: "1.2em",
                    animation:
                      isTyping() || !shouldAnimate()
                        ? undefined
                        : "blink 1s step-end infinite",
                    opacity: isTyping() ? 1 : undefined,
                    transform: "translateZ(0)",
                    "will-change": "left, top",
                  }}
                />
              )}

              {/* Unfocused overlay */}
              <div
                class="font-display absolute inset-0 z-10 flex items-center justify-center text-xl font-bold text-white backdrop-blur-none transition-opacity duration-300 data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0 data-[visible=true]:pointer-events-auto data-[visible=true]:opacity-100"
                data-visible={!isWindowFocused()}
              >
                Window Unfocused
              </div>
            </div>
            <input
              ref={inputRef}
              type="text"
              class="absolute opacity-0 focus:outline-none"
              value={currentInput()}
              disabled={false}
              onFocus={() => {
                /* Keep focus */
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                // Prevent default key behavior but process the event to ensure keyboard events are registered
                e.preventDefault();
                handleKeyDown(e);
              }}
              onInput={(e) => {
                // Prevent default input behavior
                e.preventDefault();
                // Do not process standard input - it's handled by the analog system
                // But keep this handler to make sure input events are properly registered
              }}
            />
          </div>
        )}
      </Transition>
    </div>
  );
};

export default TypeRacer;
