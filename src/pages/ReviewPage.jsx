import { checkAnswer } from "../core/engine";

export default function ReviewPage({
  questionSet,
  answers,

  resetExam,
  setActiveQuestions,
  updateState,
  setReviewMode,
  setShowAnalysis,
  startWeakStudy,
  startSpacedStudy,
  startSmartWeakStudy,
  startDifficultyStudy,
  onBack,
  score,
  wrongQuestions,
}) {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">
          Score: {score} / {questionSet.length}
        </h1>

        {/* LEGEND */}
        <div className="text-sm mb-6">🟢 Correct | 🔴 Wrong | 🟡 Missed</div>

        {/* QUESTIONS */}
        {questionSet.map((q, index) => {
          const qNum = index + 1;
          const result = checkAnswer(q, answers);
          // updateSR(q.id, updateSR.isCorrect);
          const isCorrect = result.isCorrect;
          const isPartial = result.partial;
          const ans = answers[q.id];

          return (
            <div
              key={q.id}
              className={`p-5 rounded shadow mb-5 border ${
                isCorrect
                  ? "border-green-400"
                  : isPartial
                    ? "border-yellow-400"
                    : "border-red-400"
              }`}
            >
              <h3 className="font-semibold mb-2">
                Q{qNum}: {q.question}
              </h3>

              {/* STATUS */}
              <div className="mb-2 font-semibold">
                {isCorrect
                  ? "✅ Correct"
                  : isPartial
                    ? "🟡 Partially Correct"
                    : "❌ Wrong"}
              </div>

              {/* NOT ANSWERED */}
              {ans === undefined && (
                <div className="text-sm text-gray-500 mb-2">⚠ Not answered</div>
              )}

              {/* MCQ */}
              {q.type === "mcq" &&
                q.options.map((opt, i) => {
                  const isUser = ans === i;
                  const isRight = q.correct === i;

                  let style = "bg-gray-100";

                  if (isUser && isRight) {
                    style = "bg-green-500 text-white";
                  } else if (isUser && !isRight) {
                    style = "bg-red-500 text-white";
                  } else if (!isUser && isRight) {
                    style = "bg-yellow-400 text-black";
                  }

                  return (
                    <div key={i} className={`p-2 rounded mb-1 ${style}`}>
                      {opt} {isUser && "✔"}
                    </div>
                  );
                })}

              {/* MULTI */}
              {q.type === "multi" &&
                q.options.map((opt, i) => {
                  const isUser = ans?.includes(i);
                  const isRight = q.correct.includes(i);

                  let style = "bg-gray-100";

                  if (isUser && isRight) {
                    style = "bg-green-500 text-white";
                  } else if (isUser && !isRight) {
                    style = "bg-red-500 text-white";
                  } else if (!isUser && isRight) {
                    style = "bg-yellow-400 text-black";
                  }

                  return (
                    <div key={i} className={`p-2 rounded mb-1 ${style}`}>
                      {opt} {isUser && "✔"}
                    </div>
                  );
                })}

              {/* NUMERIC / TEXT */}
              {(q.type === "numeric" || q.type === "text") && (
                <>
                  <div className="text-sm">Your: {ans ?? "Not answered"}</div>

                  <div className="text-green-600 text-sm">
                    Correct: {q.answer}
                  </div>
                </>
              )}

              {/* EXPLANATION */}
              <div className="text-sm text-gray-600 mt-2">{q.explanation}</div>
            </div>
          );
        })}

        {/* BUTTONS */}
        <div className="mt-6 flex gap-4 flex-wrap">
          <button
            onClick={resetExam}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            🔁 Restart
          </button>

          <button
            onClick={() => {
              if (!wrongQuestions || wrongQuestions.length === 0)
                if (wrongQuestions.length === 0) {
                  alert("Perfect score 😄 Nothing to retry!");
                  return;
                }

              setActiveQuestions(wrongQuestions);

              setReviewMode(false);
              updateState({
                currentQuestion: 1,
                answers: {},
                flagged: [],
                isSubmitted: false,
              });
            }}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            🔁 Retry Wrong Questions
          </button>

          <button
            onClick={() => setShowAnalysis(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            📊 View Analysis
          </button>

          <button
            onClick={startWeakStudy}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            🎯 Study Weak Areas
          </button>
          <button
            onClick={startSpacedStudy}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            🧠 Smart Study Mode
          </button>
          <button
            onClick={startSmartWeakStudy}
            className="px-4 py-2 bg-indigo-700 text-white rounded"
          >
            🚀 Smart Weak Study
          </button>
          <button
            onClick={() => startDifficultyStudy("hard")}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            🔴 Hard
          </button>

          <button
            onClick={() => startDifficultyStudy("medium")}
            className="bg-orange-500 text-white px-3 py-1 rounded"
          >
            🟠 Medium
          </button>

          <button
            onClick={() => startDifficultyStudy("easy")}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            🟢 Easy
          </button>

          {/* BACK */}
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            ⬅ Back
          </button>
        </div>
      </div>
    </div>
  );
}
