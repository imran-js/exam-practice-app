export default function MultiSelect({
  question,
  selected = [],
  onChange,
  checked,
}) {
  if (!question || !question.options) {
    return (
      <div className="text-red-500">⚠️ MultiSelect Error: No options found</div>
    );
  }

  const toggleOption = (index) => {
    let newSelection;

    if (selected.includes(index)) {
      newSelection = selected.filter((i) => i !== index);
    } else {
      newSelection = [...selected, index];
    }

    onChange(newSelection);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-500 mb-2">
        Select all correct answers
      </div>

      {question.options.map((opt, index) => {
        const isSelected = selected.includes(index);
        const isCorrect = question.correct.includes(index);

        let style = "bg-white hover:bg-gray-100 border";
        let indicator = "⬜";

        // 🔵 BEFORE CHECK
        if (!checked && isSelected) {
          style = "bg-blue-500 text-white border-blue-500";
          indicator = "✔";
        }

        // ✅ AFTER CHECK
        if (checked) {
          if (isCorrect && isSelected) {
            // ✅ Correct AND selected
            style = "bg-green-500 text-white border-green-600";
            indicator = "✔";
          } else if (isCorrect && !isSelected) {
            // ⚠ Missed correct answer
            style = "bg-yellow-400 text-black border-yellow-500";
            indicator = "!";
          } else if (!isCorrect && isSelected) {
            // ❌ Wrong selection
            style = "bg-red-500 text-white border-red-600";
            indicator = "✖";
          } else {
            style = "bg-gray-100 border";
            indicator = "⬜";
          }
        }

        return (
          <button
            key={index}
            onClick={() => toggleOption(index)}
            className={`w-full text-left p-4 rounded flex items-center justify-between transition ${style}`}
          >
            <span>{opt}</span>
            <span className="ml-4">{indicator}</span>
          </button>
        );
      })}
    </div>
  );
}
