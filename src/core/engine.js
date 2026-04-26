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

export const getWrongQuestions = (questionSet, answers) => {
  return questionSet.filter((q) => {
    // ==============================
    // CASE QUESTIONS
    // ==============================
    if (q.type === "case") {
      let hasWrong = false;

      q.questions.forEach((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const ans = answers[key];

        if (ans === undefined) {
          hasWrong = true;
          return;
        }

        if (sub.type === "mcq" && ans !== sub.correct) {
          hasWrong = true;
        }

        if (sub.type === "numeric") {
          if (Math.abs(ans - sub.answer) > (sub.tolerance || 0)) {
            hasWrong = true;
          }
        }
      });

      return hasWrong;
    }

    // ==============================
    // NORMAL QUESTIONS
    // ==============================
    const ans = answers[q.id];

    if (ans === undefined) return true;

    if (q.type === "mcq") return ans !== q.correct;

    if (q.type === "numeric") {
      return Math.abs(ans - q.answer) > (q.tolerance || 0);
    }

    if (q.type === "multi") {
      const user = ans || [];
      return !(
        user.length === q.correct.length &&
        user.every((v) => q.correct.includes(v))
      );
    }

    if (q.type === "text") {
      return ans?.toLowerCase().trim() !== q.answer.toLowerCase().trim();
    }

    if (q.type === "match") {
      return !q.pairs.every((pair, i) => ans?.[i] === pair.right);
    }

    return false;
  });
};
// ==============================
// 🧠 CHECK ANSWER
// ==============================
export const checkAnswer = (q, answers) => {
  if (q.type === "case") {
    let correct = 0;
    let total = 0;

    q.questions.forEach((sub) => {
      const key = `${q.id}_${sub.subId}`;
      const ans = answers[key];

      if (ans === undefined) return;

      total++;

      if (sub.type === "mcq" && ans === sub.correct) correct++;

      if (
        sub.type === "numeric" &&
        Math.abs(ans - sub.answer) <= (sub.tolerance || 0)
      ) {
        correct++;
      }
    });

    return {
      isCorrect: correct === total && total > 0,
      partial: correct > 0 && correct < total,
    };
  }

  const ans = answers[q.id];

  if (ans === undefined) return { isCorrect: false };

  if (q.type === "mcq") return { isCorrect: ans === q.correct };

  if (q.type === "numeric") {
    return {
      isCorrect: Math.abs(ans - q.answer) <= (q.tolerance || 0),
    };
  }

  if (q.type === "multi") {
    const user = (ans || []).map(Number);
    const correct = q.correct.map(Number);

    if (user.length !== correct.length) return { isCorrect: false };

    return {
      isCorrect: correct.every((c) => user.includes(c)),
    };
  }

  if (q.type === "text") {
    return {
      isCorrect: ans?.toLowerCase().trim() === q.answer.toLowerCase().trim(),
    };
  }

  if (q.type === "match") {
    return {
      isCorrect: q.pairs.every((pair, i) => ans?.[i] === pair.right),
    };
  }

  return { isCorrect: false };
};

export const getStats = (questionSet, answers, flagged) => {
  let answered = 0;

  questionSet.forEach((q) => {
    if (q.type === "case") {
      q.questions.forEach((sub) => {
        const key = `${q.id}_${sub.subId}`;
        if (answers[key] !== undefined) answered++;
      });
      return;
    }

    const ans = answers[q.id];

    if (
      ans !== undefined &&
      !(Array.isArray(ans) && ans.length === 0) &&
      !(
        typeof ans === "object" &&
        !Array.isArray(ans) &&
        Object.keys(ans).length === 0
      )
    ) {
      answered++;
    }
  });

  return {
    answered,
    unanswered: questionSet.length - answered,
    flagged: flagged.length,
  };
};
