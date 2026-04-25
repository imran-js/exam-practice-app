import { getDueQuestions } from "./spacedRepetition";

export const getWeakQuestions = (questions) => {
  const stats = JSON.parse(localStorage.getItem("questionStats") || "{}");

  return questions.filter((q) => {
    if (q.type === "case") {
      return q.questions.some((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const stat = stats[key];

        if (!stat) return true;

        const total = stat.correct + stat.wrong;
        const accuracy = total > 0 ? stat.correct / total : 0;

        return accuracy < 0.6;
      });
    }

    const stat = stats[q.id];

    if (!stat) return true;

    const total = stat.correct + stat.wrong;
    const accuracy = total > 0 ? stat.correct / total : 0;

    return accuracy < 0.6;
  });
};

export const getSmartWeakQuestions = (questions) => {
  const weak = getWeakQuestions(questions);
  const due = getDueQuestions(questions);

  const map = new Map();

  // Weak first
  weak.forEach((q) => map.set(q.id, q));

  // Then due
  due.forEach((q) => {
    if (!map.has(q.id)) {
      map.set(q.id, q);
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const isWeakA = weak.some((q) => q.id === a.id);
    const isWeakB = weak.some((q) => q.id === b.id);

    if (isWeakA && !isWeakB) return -1;
    if (!isWeakA && isWeakB) return 1;

    return 0;
  });
};
