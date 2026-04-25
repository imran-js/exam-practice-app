export default function Numeric({ value, onChange }) {
  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full p-3 border rounded"
      placeholder="Enter your answer"
    />
  );
}
