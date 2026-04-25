import { useState } from "react";
import TopBar from "../components/layout/TopBar";
import Sidebar from "../components/layout/Sidebar";
import MCQ from "../components/questions/MCQ";
import Numeric from "../components/questions/Numeric";
import MultiSelect from "../components/questions/MultiSelect";
import TextInput from "../components/questions/TextInput";
import Match from "../components/questions/Match";
import Timer from "../components/layout/Timer";
import { updateDailyProgress } from "../logic/dailyGoal"; // ✅ NEW

export default function ExamPage({
  questionSet,
  currentQuestion,
  totalQuestions,
  currentQ,
  answers,
  flagged,
  mode,
  toggleFlag,
  updateState,
  setShowSummary,
  setMode,
  handleTimeUp,
  timeLeft,
  clearAllAndRestart,
  weakQuestions,
}) {
  const [checked, setChecked] = useState(false);

  // ==============================
  // 🧠 CHECK CORRECTNESS
  // ==============================
  const checkAnswer = (q, ans) => {
    if (ans === undefined) return null;

    if (q.type === "mcq") return ans === q.correct;

    if (q.type === "numeric") {
      return Math.abs(ans - q.answer) <= (q.tolerance || 0);
    }

    if (q.type === "multi") {
      const user = (ans || []).map(Number);
      const correct = q.correct.map(Number);
      if (user.length !== correct.length) return false;
      return correct.every((c) => user.includes(c));
    }

    if (q.type === "text") {
      return ans?.toLowerCase().trim() === q.answer.toLowerCase().trim();
    }

    if (q.type === "match") {
      return q.pairs.every((pair, i) => ans?.[i] === pair.right);
    }

    return false;
  };

  // ==============================
  // 📊 TRACK DAILY PROGRESS (FIXED)
  // ==============================
  const handleAnswer = (key, value) => {
    const isFirstAttempt = answers[key] === undefined;

    updateState({
      answers: {
        ...answers,
        [key]: value,
      },
    });

    // ✅ ONLY count first time
    if (isFirstAttempt) {
      updateDailyProgress(1);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar current={currentQuestion} total={totalQuestions} />

      {/* NEW EXAM */}
      <div className="flex justify-between px-4 py-2">
        <button
          onClick={clearAllAndRestart}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
        >
          🔄 New Exam
        </button>
      </div>

      {/* MODE */}
      <div className="flex justify-end mb-2 px-4">
        <button
          onClick={() =>
            setMode((prev) => (prev === "exam" ? "practice" : "exam"))
          }
          className={`px-3 py-1 rounded text-sm ${
            mode === "practice" ? "bg-green-500 text-white" : "bg-gray-300"
          }`}
        >
          {mode === "practice" ? "Practice Mode ON" : "Exam Mode"}
        </button>
      </div>

      <div className="flex flex-1">
        {/* SIDEBAR */}
        <Sidebar
          questions={questionSet}
          current={currentQuestion}
          answers={answers}
          flagged={flagged}
          weakQuestions={weakQuestions}
          onSelect={(q) => {
            setChecked(false);
            updateState({ currentQuestion: q });
          }}
        />

        {/* MAIN */}
        <div className="flex-1 p-6 flex justify-center items-center bg-gray-100">
          <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl">
            {/* TITLE */}
            <h2 className="text-lg font-semibold mb-4">
              {currentQ.type === "case" ? "Case Study" : currentQ.question}
            </h2>

            {/* FLAG */}
            <button
              onClick={toggleFlag}
              className={`px-3 py-1 rounded text-sm mb-4 ${
                flagged.includes(currentQ.id) ? "bg-yellow-400" : "bg-gray-200"
              }`}
            >
              🚩 {flagged.includes(currentQ.id) ? "Flagged" : "Flag"}
            </button>

            {/* ================= CASE ================= */}
            {currentQ.type === "case" && (
              <div>
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  {currentQ.scenario}
                </div>

                {currentQ.questions?.map((sub, i) => {
                  const key = `${currentQ.id}_${sub.subId}`;
                  const ans = answers[key];
                  const isCorrect = checkAnswer(sub, ans);

                  return (
                    <div key={i} className="mb-4">
                      <div className="font-medium mb-2">{sub.question}</div>

                      {sub.type === "mcq" && (
                        <MCQ
                          question={sub}
                          selected={ans}
                          onSelect={(val) => handleAnswer(key, val)}
                        />
                      )}

                      {sub.type === "numeric" && (
                        <Numeric
                          value={ans}
                          onChange={(val) => handleAnswer(key, val)}
                        />
                      )}

                      {mode === "practice" && checked && ans !== undefined && (
                        <div className="mt-2 text-sm border p-2 rounded">
                          <div className="font-semibold">
                            {isCorrect ? "✅ Correct" : "❌ Wrong"}
                          </div>

                          <div className="text-green-600">
                            Correct:{" "}
                            {sub.type === "mcq"
                              ? sub.options[sub.correct]
                              : sub.answer}
                          </div>

                          <div className="text-gray-600">{sub.explanation}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ================= NORMAL ================= */}
            {currentQ.type === "mcq" && (
              <MCQ
                question={currentQ}
                selected={answers[currentQ.id]}
                onSelect={(ans) => handleAnswer(currentQ.id, ans)}
              />
            )}

            {currentQ.type === "numeric" && (
              <Numeric
                value={answers[currentQ.id]}
                onChange={(val) => handleAnswer(currentQ.id, val)}
              />
            )}

            {currentQ.type === "multi" && (
              <MultiSelect
                question={currentQ}
                selected={answers[currentQ.id] || []}
                onChange={(val) => handleAnswer(currentQ.id, val)}
              />
            )}

            {currentQ.type === "text" && (
              <TextInput
                value={answers[currentQ.id]}
                onChange={(val) => handleAnswer(currentQ.id, val)}
              />
            )}

            {currentQ.type === "match" && (
              <Match
                question={currentQ}
                value={answers[currentQ.id] || {}}
                onChange={(val) => handleAnswer(currentQ.id, val)}
              />
            )}

            {/* PRACTICE FEEDBACK */}
            {mode === "practice" &&
              checked &&
              currentQ.type !== "case" &&
              (() => {
                const ans = answers[currentQ.id];
                const isCorrect = checkAnswer(currentQ, ans);

                if (ans === undefined) return null;

                return (
                  <div className="mt-4 p-3 border rounded">
                    <div className="font-semibold">
                      {isCorrect ? "✅ Correct" : "❌ Wrong"}
                    </div>

                    <div className="text-green-600 mt-1">
                      Correct Answer:{" "}
                      {currentQ.type === "mcq"
                        ? currentQ.options[currentQ.correct]
                        : currentQ.type === "multi"
                          ? currentQ.correct
                              .map((i) => currentQ.options[i])
                              .join(", ")
                          : currentQ.answer}
                    </div>

                    <div className="text-gray-600 mt-1">
                      {currentQ.explanation}
                    </div>
                  </div>
                );
              })()}

            {/* NAV */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setChecked(false);
                  updateState({
                    currentQuestion: Math.max(currentQuestion - 1, 1),
                  });
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Previous
              </button>

              <button
                onClick={() => {
                  setChecked(false);
                  updateState({
                    currentQuestion: Math.min(
                      currentQuestion + 1,
                      totalQuestions,
                    ),
                  });
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next
              </button>
            </div>

            {/* PRACTICE BUTTONS */}
            {mode === "practice" && (
              <>
                <button
                  onClick={() => setChecked(true)}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Check Answer
                </button>

                {checked && (
                  <button
                    onClick={() => setChecked(false)}
                    className="mt-2 w-full px-4 py-2 bg-teal-500 text-white rounded"
                  >
                    Change Answer
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setShowSummary(true)}
              className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* TIMER */}
      {mode === "exam" && (
        <div className="fixed bottom-4 right-4">
          <Timer
            timeLeft={timeLeft}
            onTick={() => {
              updateState((prev) => {
                if (prev.timeLeft <= 1) {
                  handleTimeUp();
                  return { ...prev, timeLeft: 0 };
                }
                return {
                  ...prev,
                  timeLeft: prev.timeLeft - 1,
                };
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
