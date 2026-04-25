import { getDifficulty } from "../../logic/difficulty";

export default function Sidebar({
  current,
  answers,
  flagged,
  onSelect,
  questions,
  weakQuestions,
}) {
  const weakIds = new Set((weakQuestions || []).map((q) => q.id));

  return (
    <div className="w-72 bg-white border-r shadow-sm flex flex-col">
      {/* HEADER */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Questions</h2>
        <p className="text-xs text-gray-500 mt-1">Navigate your exam</p>
      </div>

      {/* LEGEND */}
      <div className="px-4 py-3 flex flex-wrap gap-2 text-xs">
        <Legend color="bg-blue-500" label="Current" />
        <Legend color="bg-green-400" label="Answered" />
        <Legend color="bg-red-400" label="Weak" />
        <Legend color="bg-yellow-400" label="Flagged" />
      </div>
      {/* QUESTIONS GRID */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-3">
          {questions.map((q, i) => {
            const qNum = i + 1;
            const difficulty = getDifficulty(q.id);

            const isActive = current === qNum;
            const isAnswered = answers[q.id] !== undefined;
            const isFlagged = flagged.includes(q.id);
            const isWeak = weakIds.has(q.id);

            //             | State    | Color          |
            // | -------- | -------------- |
            // | Current  | 🔵 Blue        |
            // | Flagged  | 🟡 Yellow      |
            // | Answered | 🟢 Green       |
            // | Hard     | 🔴 Red         |
            // | Medium   | 🟠 Orange      |
            // | Easy     | 🟢 Light green |

            let style = "bg-gray-200";

            if (isActive) {
              style = "bg-blue-500 text-white";
            } else if (isFlagged) {
              style = "bg-yellow-400 text-black";
            } else if (isAnswered) {
              style = "bg-green-500 text-white"; // ✅ THIS WAS MISSING PRIORITY
            } else if (difficulty === "hard") {
              style = "bg-red-400 text-white";
            } else if (difficulty === "medium") {
              style = "bg-orange-400 text-white";
            } else if (difficulty === "easy") {
              style = "bg-green-300 text-white";
            }

            return (
              <button
                key={q.id}
                onClick={() => onSelect(qNum)}
                className={`relative w-11 h-11 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150 ${style}`}
              >
                {qNum}

                {/* WEAK DOT */}
                {isWeak && !isActive && (
                  <span className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
