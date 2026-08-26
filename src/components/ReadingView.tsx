import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, ArrowLeft, Settings2 } from "lucide-react";
import { parseWords, getWordFocalPoint } from "../utils";

interface ReadingViewProps {
  text: string;
  onBack: () => void;
}

const DEFAULT_WPM = 300;

export function ReadingView({ text, onBack }: ReadingViewProps) {
  const words = React.useMemo(() => parseWords(text), [text]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [showSettings, setShowSettings] = useState(false);

  // Interval reference for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = useCallback(
    (word: string) => {
      const baseDelay = (60 / wpm) * 1000;
      // Add extra time for punctuation to improve comprehension
      if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) {
        return baseDelay * 2.5;
      }
      if (word.endsWith(",") || word.endsWith(";") || word.endsWith(":")) {
        return baseDelay * 1.5;
      }
      // Longer words get a slight delay
      if (word.length > 8) {
        return baseDelay * 1.2;
      }
      return baseDelay;
    },
    [wpm]
  );

  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const delay = calculateDelay(words[currentIndex]);
      intervalRef.current = setTimeout(() => {
        setCurrentIndex((prev) => {
          if (prev + 1 >= words.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, words, calculateDelay]);

  const togglePlay = () => {
    if (currentIndex >= words.length - 1 && !isPlaying) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const currentWord = words[currentIndex] || "";
  const { left, focal, right } = getWordFocalPoint(currentWord);
  
  const progress = words.length > 0 ? (currentIndex / (words.length - 1)) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto h-[100dvh] flex flex-col items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between py-4">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Back to Edit"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-sm font-medium text-neutral-500">
          {currentIndex + 1} / {words.length}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          title="Settings"
        >
          <Settings2 className="w-6 h-6" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6 mb-8 border border-neutral-200 dark:border-neutral-800 animate-in fade-in slide-in-from-top-4">
          <label className="flex flex-col space-y-4">
            <div className="flex justify-between items-center font-medium">
              <span>Reading Speed</span>
              <span className="text-blue-600 dark:text-blue-400">{wpm} WPM</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="10"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </label>
        </div>
      )}

      {/* Word Display */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[300px]">
        {/* Alignment Guide */}
        <div className="relative w-full max-w-md h-32 flex items-center justify-center mb-8">
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-neutral-200 dark:bg-neutral-800 -translate-x-1/2 z-0" />
          
          <div 
            className="text-4xl sm:text-6xl md:text-7xl font-mono tracking-tight z-10 flex w-full cursor-pointer select-none"
            onClick={togglePlay}
          >
            <span className="text-right w-[45%] text-neutral-800 dark:text-neutral-200 truncate">{left}</span>
            <span className="text-red-500 font-bold w-[10%] text-center">{focal}</span>
            <span className="text-left w-[45%] text-neutral-800 dark:text-neutral-200 truncate">{right}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mb-8 flex flex-col items-center space-y-8">
        {/* Scrub Bar */}
        <div className="w-full group">
          <input
            type="range"
            min="0"
            max={Math.max(0, words.length - 1)}
            value={currentIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentIndex(Number(e.target.value));
            }}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={handleReset}
            className="p-4 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
          
          <button
            onClick={togglePlay}
            className="p-6 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
