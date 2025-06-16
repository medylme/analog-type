import {
  Component,
  createSignal,
  onMount,
  createEffect,
  onCleanup,
} from "solid-js";
import { Transition } from "solid-transition-group";

import { KEY_MAP } from "@/constants/InputContextConstants";
import { useTyping } from "@/contexts/TypingContext";
import { useKeyboard } from "@/contexts/InputContext";
import wordService from "@/services/WordService";

type KeyActuationState = {
  isActuated: boolean;
  wasAboveMax: boolean;
  code: number;
  value: number;
};

const TypeRacer: Component = () => {
  const {
    initialSettings,
    runningSettings,
    typingText,
    isTestComplete,
    updateMetrics,
    startTime,
    setStartTime,
    setRemainingTime,
    startCountdown,
    completeTest,
    randomizeBracket,
  } = useTyping();

  const { pressedKeys } = useKeyboard();

  const [keyActuationStates, setKeyActuationStates] = createSignal<
    Record<number, KeyActuationState>
  >({});
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
  let typingTimer: NodeJS.Timeout;
  let metricsTimer: NodeJS.Timeout;
  let cursorUpdateRaf: number;
  let lineHeight = 0;

  // Process analog key inputs and handle actuation based on targetBracket settings
  createEffect(() => {
    // Ignore all input if window is not focused
    if (!isWindowFocused()) return;

    const currentKeys = pressedKeys();
    const targetBracket = {
      ...initialSettings().targetBracket,
      min:
        runningSettings().targetBracket?.min ??
        initialSettings().targetBracket?.min ??
        0,
      max:
        runningSettings().targetBracket?.max ??
        initialSettings().targetBracket?.max ??
        1,
    };

    if (!targetBracket || currentKeys.length === 0) return;

    let actuationsToTrigger: number[] = [];
    let lastActuated = lastActuatedKeys();

    // Handle each pressed key
    currentKeys.forEach((key) => {
      if (key.value < 0.01) return;

      if (targetBracket.enabled) {
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
        }
        // If key wasn't above max, check normal actuation
        else if (!keyState?.wasAboveMax) {
          // Check if key has crossed the min threshold and hasn't been actuated yet
          if (key.value >= targetBracket.min && !lastActuated.has(key.code)) {
            actuationsToTrigger.push(key.code);
            lastActuated.add(key.code);

            setKeyActuationStates((prev) => ({
              ...prev,
              [key.code]: {
                code: key.code,
                value: key.value,
                isActuated: true,
                wasAboveMax: false,
              },
            }));
          }

          // Check if an actuated key has gone above max
          if (key.value > targetBracket.max && keyState?.isActuated) {
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
        }
      }
    });

    // For bracket and actuation point modes, reset keys that have fallen below the threshold
    currentKeys.forEach((key) => {
      if (key.value < targetBracket.min && lastActuated.has(key.code)) {
        // Only reset keys that haven't gone past max
        if (!keyActuationStates()[key.code]?.wasAboveMax) {
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

    const char = getCharFromKeyCode(keyCode);
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

      // Check if we've completed a line and should randomize the bracket
      if (
        initialSettings().challengeType === "challenge" &&
        checkForLineCompletion(currentIndex() - 1)
      ) {
        randomizeBracket();
      }

      if (startTime() === null) {
        setStartTime(Date.now());
        if (
          initialSettings().mode === "time" &&
          initialSettings().timeSeconds
        ) {
          setRemainingTime(initialSettings().timeSeconds);
          startCountdown();
        }
      }
    }

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
    if (
      initialSettings().mode === "words" &&
      currentIndex() >= displayText().length
    ) {
      completeTest();
    }
  };

  // Convert key code to character
  const getCharFromKeyCode = (keyCode: number): string | null => {
    return KEY_MAP[keyCode] || null;
  };

  // Lines management functions
  const getLineHeight = (): number => {
    if (lineHeight) return lineHeight;
    if (!textContainerRef) return 24;

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

    // Approximation of line breaks
    const measureSpan = document.createElement("span");
    measureSpan.style.visibility = "hidden";
    measureSpan.style.position = "absolute";
    measureSpan.style.whiteSpace = "pre-wrap";
    measureSpan.style.wordBreak = "break-word";
    measureSpan.style.width = textDisplayRef.clientWidth + "px";
    measureSpan.style.font = window.getComputedStyle(textDisplayRef).font;
    document.body.appendChild(measureSpan);

    while (currPos < text.length) {
      const lineEnd = getLineEndPosition(text, currPos);
      const lineText = text.substring(currPos, lineEnd);

      measureSpan.textContent = lineText;
      const textHeight = measureSpan.offsetHeight;
      const textLines = Math.round(textHeight / getLineHeight());

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

    // Check if we're at the end of a word
    const isAtWordEnd =
      currentPos > 0 &&
      (displayText()[currentPos - 1] === " " ||
        displayText()[currentPos - 1] === "\n");

    if (
      currentLineIndex > 1 &&
      isAtWordEnd &&
      currentPos >= lineStarts[currentLineIndex]
    ) {
      const linesToScroll = Math.max(0, currentLineIndex - 1);

      setScrollOffset(linesToScroll * getLineHeight());

      if (textDisplayRef) {
        textDisplayRef.style.transform = `translateY(-${scrollOffset()}px)`;
      }
    } else if (currentLineIndex === 1 && isAtWordEnd) {
      const thirdLineStart =
        lineStarts.length > 2 ? lineStarts[2] : displayText().length;

      if (currentPos >= thirdLineStart) {
        setScrollOffset(getLineHeight());

        if (textDisplayRef) {
          textDisplayRef.style.transform = `translateY(-${scrollOffset()}px)`;
        }
      }
    }
  };

  const appendMoreTextIfNeeded = () => {
    if (
      initialSettings().mode === "time" &&
      currentIndex() > nextGenerationPoint()
    ) {
      const additionalText = wordService.appendMoreWords(50);
      setDisplayText(displayText() + " " + additionalText);
      setNextGenerationPoint(displayText().length * 0.75);
    }
  };

  // Effect to handle window resizing
  createEffect(() => {
    if (textContainerRef) {
      const observer = new ResizeObserver(() => {
        lineHeight = 0;
        updateScrollPosition();
      });

      observer.observe(textContainerRef);

      onCleanup(() => {
        observer.disconnect();
      });
    }
  });

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
    const text = typingText();

    if (initialSettings().mode === "time") {
      setDisplayText(text);
    } else {
      // For word count mode, only display exactly the number of words needed
      const wordCount = initialSettings().wordCount || 25;
      const words = text.split(" ").slice(0, wordCount);
      setDisplayText(words.join(" "));
    }

    setNextGenerationPoint(text.length * 0.75);

    resetComponentState();
  });

  const updateCursorPosition = () => {
    if (!textContainerRef || !spanRefs[currentIndex()]) return;

    const rect = spanRefs[currentIndex()].getBoundingClientRect();
    const containerRect = textContainerRef.getBoundingClientRect();

    if (containerRect) {
      // Calculate visual cursor position, adjusting for scroll
      let cursorTop = rect.top - containerRect.top;

      // Determine which visual line the cursor is on
      const lineHeight = getLineHeight();
      const visualLine = Math.floor(cursorTop / lineHeight);

      // Get total number of lines in current text
      const { lineStarts } = calculateLinePositions();
      const isLastLine =
        currentIndex() > 0 &&
        lineStarts.findIndex((start) => start > currentIndex()) === 1;

      // If we're not on the last line of text, keep cursor on second visible line
      if (visualLine >= 2 && !isLastLine) {
        cursorTop = lineHeight * 1;
      }

      setCursorPosition({
        left: rect.left - containerRect.left,
        top: cursorTop,
      });
    }
  };

  createEffect(() => {
    if (cursorUpdateRaf) {
      cancelAnimationFrame(cursorUpdateRaf);
    }

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

    // Calculate score: count of correctly typed words
    let score = 0;
    let wordStart = 0;

    // Iterate through the text word by word
    for (let i = 0; i <= currentIndex(); i++) {
      // Check if we've reached the end of a word or the end of the text
      if (
        i === currentIndex() ||
        displayText()[i] === " " ||
        displayText()[i] === "\n"
      ) {
        // Check if the current word is typed correctly
        let isWordCorrect = true;
        for (let j = wordStart; j < i; j++) {
          if (currentInput()[j] !== displayText()[j]) {
            isWordCorrect = false;
            break;
          }
        }

        // Increment score if the word was typed correctly
        if (isWordCorrect && i > wordStart) {
          score++;
        }

        // Update word start position for the next word
        wordStart = i + 1;
      }
    }

    const newMetrics = { wpm, rawWpm, cpm, accuracy, score };

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

  const getCharClass = (index: number) => {
    if (index < currentIndex()) {
      return currentInput()[index] === displayText()[index]
        ? "text-primary"
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
      initialSettings().mode === "words" &&
      currentIndex() === displayText().length
    ) {
      completeTest();
    }
  });

  // Helper function to check if we've completed a line of text
  const checkForLineCompletion = (index: number) => {
    if (!textDisplayRef) return false;

    const char = displayText()[index];
    if (!char) return false;

    if (char === " " || char === "\n") {
      const { lineStarts } = calculateLinePositions();

      let currentLineIdx = -1;
      for (let i = 0; i < lineStarts.length; i++) {
        if (lineStarts[i] > index) {
          currentLineIdx = i - 1;
          break;
        }
      }

      if (currentLineIdx === -1) {
        currentLineIdx = 0;
      }

      const nextLineStart =
        lineStarts[currentLineIdx + 1] || displayText().length;
      const nextSpaceIdx = displayText().indexOf(" ", index + 1);

      return nextSpaceIdx === -1 || nextSpaceIdx >= nextLineStart;
    }

    return false;
  };

  onMount(() => {
    if (inputRef) {
      inputRef.focus();
      // Disable standard input handling - only use analog data
      inputRef.disabled = false;
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
    }, 100);

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
      class="overflow-hidden"
      tabIndex={-1}
      onFocus={() => inputRef?.focus()}
      onBlur={() => setTimeout(() => inputRef?.focus(), 10)}
    >
      <Transition
        name="text-paragraph"
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
                  transition: "transform 0.3s ease-in-out",
                }}
              >
                {displayText()
                  .split("")
                  .map((char, index) => (
                    <span
                      ref={(el) => (spanRefs[index] = el)}
                      class={`transition-colors !duration-200 ${getCharClass(
                        index
                      )}`}
                    >
                      {char}
                    </span>
                  ))}
              </div>
              {!isTestComplete() && isWindowFocused() && (
                <div
                  class="bg-primary absolute w-0.5 transition-all duration-100"
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
              class="absolute text-balance opacity-0 focus:outline-none"
              value={currentInput()}
              disabled={false}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                // Prevent default key behavior
                e.preventDefault();
              }}
              onInput={(e) => {
                // Prevent default input behavior
                e.preventDefault();
              }}
            />
          </div>
        )}
      </Transition>
    </div>
  );
};

export default TypeRacer;
