import { questions } from "../data/questions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { getTodayProgress } from "../logic/dailyGoal";

export default function Dashboard({ onBack, onPracticeTopic }) {
  const history = JSON.parse(localStorage.getItem("examHistory") || "[]");

  // ==============================
  // 📊 STATS
  // ==============================
  const totalAttempts = history.length;

  const avgScore =
    totalAttempts === 0
      ? 0
      : Math.round(
          history.reduce((sum, h) => sum + h.percentage, 0) / totalAttempts,
        );

  // ==============================
  // 🔥 STREAK (FIXED)
  // ==============================
  const getStreak = () => {
    if (history.length === 0) return 0;

    const days = new Set(history.map((h) => new Date(h.date).toDateString()));

    let streak = 0;
    let current = new Date();

    while (true) {
      const key = current.toDateString();

      if (days.has(key)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else break;
    }

    return streak;
  };

  const streak = getStreak();

  // ==============================
  // 📈 CHART DATA
  // ==============================
  const chartData = history
    .slice()
    .reverse()
    .map((item, i) => ({
      name: `#${i + 1}`,
      score: item.percentage,
    }));

  // ==============================
  // 📊 WEAK TOPICS
  // ==============================
  const stats = JSON.parse(localStorage.getItem("questionStats") || "{}");

  const topicMap = {};

  questions.forEach((q) => {
    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { correct: 0, total: 0 };
    }

    if (q.type === "case") {
      q.questions.forEach((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const stat = stats[key];

        if (stat) {
          topicMap[q.topic].correct += stat.correct;
          topicMap[q.topic].total += stat.correct + stat.wrong;
        }
      });
    } else {
      const stat = stats[q.id];

      if (stat) {
        topicMap[q.topic].correct += stat.correct;
        topicMap[q.topic].total += stat.correct + stat.wrong;
      }
    }
  });

  const topicData = Object.entries(topicMap)
    .map(([topic, data]) => {
      const pct =
        data.total === 0 ? null : Math.round((data.correct / data.total) * 100);

      return { topic, score: pct };
    })
    .filter((t) => t.score !== null)
    .sort((a, b) => a.score - b.score);

  const heatmapData = history.map((item) => ({
    date: item.date.split("T")[0],
    count: item.percentage,
  }));
  const today = getTodayProgress();
  const percent = Math.min(
    100,
    Math.round((today.completed / today.goal) * 100),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          📊 Daily Study Dashboard
        </h1>

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: "Attempts", value: totalAttempts },
            { label: "Avg Score", value: `${avgScore}%` },
            { label: "Day Streak", value: `🔥 ${streak}` },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-md text-center hover:shadow-lg transition"
            >
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm text-gray-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* PROGRESS CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="font-semibold mb-4 text-gray-700">
            📈 Progress Trend
          </h2>

          {chartData.length < 2 ? (
            <div className="text-center text-gray-400 py-10">
              Take more tests to see progress 📊
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* WEAK TOPICS */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="font-semibold mb-4 text-gray-700">
            📊 Weak Topics (Focus Here)
          </h2>

          {topicData.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topicData}
                barSize={40}
                onClick={(e) => {
                  if (e?.activePayload?.[0]) {
                    const topic = e.activePayload[0].payload.topic;
                    onPracticeTopic(topic);
                  }
                }}
              >
                <XAxis
                  dataKey="topic"
                  angle={-20}
                  textAnchor="end"
                  height={70}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />

                <Bar
                  dataKey="score"
                  label={{ position: "top" }}
                  shape={(props) => {
                    const { x, y, width, height, payload } = props;

                    let color = "#22c55e";
                    if (payload.score < 50) color = "#dc2626";
                    else if (payload.score < 75) color = "#f59e0b";

                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx={6}
                        fill={color}
                        style={{ cursor: "pointer" }}
                        onClick={() => onPracticeTopic(payload.topic)} // ✅ FIX HERE
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* HISTORY */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="font-semibold mb-4 text-gray-700">Recent Activity</h2>

          {history.length === 0 ? (
            <div className="text-gray-400">No activity yet</div>
          ) : (
            history.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b text-sm"
              >
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span className="font-medium">{item.percentage}%</span>
              </div>
            ))
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="font-semibold mb-3 text-gray-700">🎯 Daily Goal</h2>

          <div className="flex justify-between text-sm mb-2">
            <span>
              {today.completed} / {today.goal} questions
            </span>
            <span>{percent}%</span>
          </div>

          <div className="w-full bg-gray-200 h-3 rounded">
            <div
              className="h-3 rounded bg-blue-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* HeatMAP */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="font-semibold mb-4 text-gray-700">
            🔥 Study Activity
          </h2>

          {heatmapData.length === 0 ? (
            <div className="text-gray-400">No activity yet</div>
          ) : (
            <CalendarHeatmap
              startDate={
                new Date(new Date().setDate(new Date().getDate() - 90))
              }
              endDate={new Date()}
              values={heatmapData}
              classForValue={(value) => {
                if (!value) return "color-empty";
                if (value.count < 50) return "color-scale-1";
                if (value.count < 75) return "color-scale-2";
                return "color-scale-3";
              }}
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) return {};
                return {
                  "data-tip": `${value.date} → ${value.count}%`,
                };
              }}
            />
          )}
        </div>

        {/* BACK */}
        <button
          onClick={onBack}
          className="px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition"
        >
          ⬅ Back
        </button>
      </div>
    </div>
  );
}
