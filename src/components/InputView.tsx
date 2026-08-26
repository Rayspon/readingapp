import React, { useState, useRef } from "react";
import { Camera, FileImage, Play, Loader2 } from "lucide-react";
import { cn } from "../utils";

interface InputViewProps {
  initialText: string;
  onStartReading: (text: string) => void;
}

export function InputView({ initialText, onStartReading }: InputViewProps) {
  const [text, setText] = useState(initialText);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    if (text.trim().length > 0) {
      onStartReading(text.trim());
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsExtracting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64DataUrl = event.target?.result as string;
        
        // Extract base64 without the prefix
        const match = base64DataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (!match) {
          throw new Error("Failed to process image format.");
        }
        
        const mimeType = match[1];
        const imageBase64 = match[2];

        const response = await fetch("/api/extract-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageBase64, mimeType }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to extract text");
        }

        const data = await response.json();
        setText((prev) => (prev ? prev + "\n\n" + data.text : data.text));
      };
      
      reader.onerror = () => {
        throw new Error("Failed to read file.");
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during extraction.");
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-[calc(100vh-4rem)] p-4 space-y-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2">
          Speed Reader
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Paste your text or scan a book page to read faster with RSVP.
        </p>
      </div>

      <div className="flex-1 relative flex flex-col min-h-[300px]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here to start reading..."
          className="flex-1 w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg shadow-sm"
          disabled={isExtracting}
        />
        
        {isExtracting && (
          <div className="absolute inset-0 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center z-10 text-neutral-800 dark:text-neutral-200">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
            <p className="font-medium">Extracting text with AI...</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isExtracting}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          <span>Scan Page</span>
        </button>

        <button
          onClick={handleStart}
          disabled={text.trim().length === 0 || isExtracting}
          className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          <Play className="w-5 h-5" />
          <span>Start Reading</span>
        </button>
      </div>
    </div>
  );
}
