import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProgressChart({ data }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tickFormatter={(d) => new Date(d).toLocaleDateString()}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip labelFormatter={(d) => new Date(d).toLocaleString()} />
          <Line type="monotone" dataKey="percentage" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
