export const calculateScore = (questionSet, answers) => {
  let score = 0;

  questionSet.forEach((q) => {
    const userAnswer = answers[q.id];

    if (q.type === "mcq" && userAnswer === q.correct) score++;

    if (
      q.type === "numeric" &&
      userAnswer !== undefined &&
      Math.abs(userAnswer - q.answer) <= (q.tolerance || 0)
    ) {
      score++;
    }

    if (q.type === "multi") {
      const user = userAnswer || [];
      if (
        user.length === q.correct.length &&
        user.every((v) => q.correct.includes(v))
      ) {
        score++;
      }
    }

    if (q.type === "text") {
      if (userAnswer?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        score++;
      }
    }

    if (q.type === "match") {
      const user = userAnswer || {};
      if (q.pairs.every((pair, i) => user[i] === pair.right)) {
        score++;
      }
    }

    if (q.type === "case") {
      q.questions.forEach((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const ans = answers[key];

        if (sub.type === "mcq" && ans === sub.correct) score++;

        if (
          sub.type === "numeric" &&
          Math.abs(ans - sub.answer) <= (sub.tolerance || 0)
        ) {
          score++;
        }
      });
    }
  });

  return score;
};

export const analyzePerformance = (questionSet, answers) => {
  const stats = {};

  questionSet.forEach((q) => {
    const topic = q.topic || "General";

    if (!stats[topic]) {
      stats[topic] = { correct: 0, total: 0 };
    }

    if (q.type === "case") {
      q.questions.forEach((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const ans = answers[key];

        stats[topic].total++;

        if (sub.type === "mcq" && ans === sub.correct) {
          stats[topic].correct++;
        }

        if (
          sub.type === "numeric" &&
          Math.abs(ans - sub.answer) <= (sub.tolerance || 0)
        ) {
          stats[topic].correct++;
        }
      });

      return;
    }

    const ans = answers[q.id];
    stats[topic].total++;

    if (q.type === "mcq" && ans === q.correct) stats[topic].correct++;

    if (
      q.type === "numeric" &&
      Math.abs(ans - q.answer) <= (q.tolerance || 0)
    ) {
      stats[topic].correct++;
    }

    if (q.type === "multi") {
      if (
        ans?.length === q.correct.length &&
        ans.every((v) => q.correct.includes(v))
      ) {
        stats[topic].correct++;
      }
    }

    if (q.type === "text") {
      if (ans?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
        stats[topic].correct++;
      }
    }

    if (q.type === "match") {
      if (q.pairs.every((pair, i) => ans?.[i] === pair.right)) {
        stats[topic].correct++;
      }
    }
  });

  return stats;
};
