// | Level  | Meaning         |
// | ------ | --------------- |
// | Easy   | You mastered it |
// | Medium | Still learning  |
// | Hard   | You struggle    |

// | Accuracy | Difficulty |
// | -------- | ---------- |
// | ≥ 80%    | Easy       |
// | 50–80%   | Medium     |
// | < 50%    | Hard       |

const STORAGE_KEY = "questionStats";

export const getStats = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
};

export const getDifficulty = (questionId) => {
  const stats = getStats();
  const stat = stats[questionId];

  if (!stat) return "new";

  const total = stat.correct + stat.wrong;
  if (total === 0) return "new";

  const accuracy = stat.correct / total;

  if (accuracy >= 0.8) return "easy";
  if (accuracy >= 0.5) return "medium";
  return "hard";
};
