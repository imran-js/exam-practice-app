// ==============================
// 🧠 HELPERS (outside component)
// ==============================
const getWeakestTopic = (analysis) => {
  let weakest = null;
  let lowestScore = 101;

  Object.entries(analysis).forEach(([topic, data]) => {
    const percentage = data.total === 0 ? 0 : (data.correct / data.total) * 100;

    if (percentage < lowestScore) {
      lowestScore = percentage;
      weakest = { topic, percentage, ...data };
    }
  });

  return weakest && weakest.total > 0 ? weakest : null; // ✅ FIXED
};

// ==============================
// 📊 COMPONENT
// ==============================
export default function AnalysisPage({
  analysis,
  history,
  onBack,
  onPracticeTopic,
}) {
  const weakest = getWeakestTopic(analysis);

  return (
    <div className="min-h-screen bg-gray-100 py-10 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">📊 Analysis</h1>

        {/* 🔴 Weakest */}
        {weakest && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded shadow">
            <div className="font-semibold text-red-700">
              Weakest Area: {weakest.topic}
            </div>

            <div className="text-sm text-red-600">
              {weakest.correct}/{weakest.total} (
              {Math.round(weakest.percentage)}%)
            </div>

            <button
              onClick={() => {
                console.log("CLICKED:", weakest.topic);
                onPracticeTopic(weakest.topic);
              }}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Practice This Topic
            </button>
          </div>
        )}

        {/* 📊 Performance */}
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Performance</h2>

          {Object.entries(analysis).map(([topic, data]) => {
            const pct =
              data.total === 0
                ? 0
                : Math.round((data.correct / data.total) * 100);

            return (
              <div
                key={topic}
                className="mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() => onPracticeTopic(topic)}
              >
                <div className="flex justify-between">
                  <span>{topic}</span>
                  <span>
                    {data.correct}/{data.total}
                  </span>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded mt-1">
                  <div
                    className={`h-2 rounded ${
                      pct > 70
                        ? "bg-green-500"
                        : pct > 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 📜 History */}
        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Progress History</h2>

          {history.length === 0 ? (
            <div className="text-sm text-gray-500">No attempts yet</div>
          ) : (
            history.slice(0, 5).map((item, i) => (
              <div key={i} className="flex justify-between text-sm mb-1">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span>{item.percentage}%</span>
              </div>
            ))
          )}
        </div>

        {/* 🔙 Back */}
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          ⬅ Back
        </button>
      </div>
    </div>
  );
}
