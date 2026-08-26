/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { InputView } from "./components/InputView";
import { ReadingView } from "./components/ReadingView";

type ViewState = "input" | "reading";

export default function App() {
  const [view, setView] = useState<ViewState>("input");
  const [text, setText] = useState("");

  const handleStartReading = (newText: string) => {
    setText(newText);
    setView("reading");
  };

  const handleBackToInput = () => {
    setView("input");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      {view === "input" ? (
        <InputView initialText={text} onStartReading={handleStartReading} />
      ) : (
        <ReadingView text={text} onBack={handleBackToInput} />
      )}
    </div>
  );
}
