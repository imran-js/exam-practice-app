import { useState } from "react";

export default function ImportQuestions({ onLoad }) {
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        // ✅ BASIC VALIDATION
        if (!Array.isArray(data)) {
          throw new Error("JSON must be an array of questions");
        }

        // check minimal structure
        const valid = data.every((q) => q.id && q.type);

        if (!valid) {
          throw new Error("Invalid question format");
        }

        setError("");
        onLoad(data);
      } catch (err) {
        setError(err.message);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="mb-4">
      <input type="file" accept=".json" onChange={handleFile} />

      {error && <div className="text-red-500 text-sm mt-2">❌ {error}</div>}
    </div>
  );
}
