export default function Match({ question, value = {}, onChange }) {
  if (!question || !question.pairs) {
    return <div className="text-red-500">⚠ Match Error: No pairs found</div>;
  }

  return (
    <div className="space-y-3">
      {question.pairs.map((pair, index) => (
        <div key={index} className="flex gap-4 items-center">
          {/* LEFT */}
          <div className="w-1/2 p-2 bg-gray-100 rounded">{pair.left}</div>

          {/* SELECT */}
          <select
            value={value[index] || ""}
            onChange={(e) =>
              onChange({
                ...value,
                [index]: e.target.value,
              })
            }
            className="w-1/2 p-2 border rounded"
          >
            <option value="">Select</option>

            {question.pairs.map((p, i) => (
              <option key={i} value={p.right}>
                {p.right}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
