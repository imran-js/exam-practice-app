import { useEffect, useState } from "react";
import { saveExamState, loadExamState, clearExamState } from "../storage";

export default function useExamState() {
  // ✅ Initialize state from storage (NO effect needed)
  const [state, setState] = useState(() => {
    const saved = loadExamState();

    return (
      saved || {
        currentQuestion: 1,
        answers: {},
        flagged: [],
        timeLeft: 5400,
        isSubmitted: false,
      }
    );
  });

  // 💾 Save on change
  useEffect(() => {
    saveExamState(state);
  }, [state]);

  // 🔁 Update helper
  const updateState = (updates) => {
    if (typeof updates === "function") {
      setState((prev) => updates(prev));
    } else {
      setState((prev) => ({ ...prev, ...updates }));
    }
  };

  return {
    state,
    updateState,
    clearExamState,
  };
}
