export default function MCQ({ question, selected, onSelect, checked }) {
  return (
    <div className="space-y-3">
      {question.options.map((opt, index) => {
        const isSelected = selected === index;
        const isCorrect = index === question.correct;

        let style = "bg-white hover:bg-gray-100 border";

        // 🔵 Before checking
        if (!checked && isSelected) {
          style = "bg-blue-500 text-white border-blue-500";
        }

        // ✅ After checking
        if (checked) {
          if (isCorrect) {
            style = "bg-green-500 text-white border-green-600";
          } else if (isSelected && !isCorrect) {
            style = "bg-red-500 text-white border-red-600";
          } else {
            style = "bg-gray-100 border";
          }
        }

        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full text-left p-4 rounded transition ${style}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
