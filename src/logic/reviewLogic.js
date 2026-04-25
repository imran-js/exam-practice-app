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

export const getSmartRetryQuestions = (questionSet, answers) => {
  const result = [];

  questionSet.forEach((q) => {
    // ==============================
    // CASE QUESTIONS
    // ==============================
    if (q.type === "case") {
      q.questions.forEach((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const ans = answers[key];

        let isWrong = false;

        if (ans === undefined) isWrong = true;

        if (sub.type === "mcq" && ans !== sub.correct) isWrong = true;

        if (sub.type === "numeric") {
          if (Math.abs(ans - sub.answer) > (sub.tolerance || 0)) {
            isWrong = true;
          }
        }

        if (isWrong) {
          result.push({
            id: key, // unique id
            type: sub.type,
            topic: q.topic,
            question: `${q.scenario} → ${sub.question}`,
            options: sub.options,
            correct: sub.correct,
            answer: sub.answer,
            tolerance: sub.tolerance,
            explanation: sub.explanation,
          });
        }
      });

      return;
    }

    // ==============================
    // NORMAL QUESTIONS
    // ==============================
    const ans = answers[q.id];

    let isWrong = false;

    if (ans === undefined) isWrong = true;

    if (q.type === "mcq" && ans !== q.correct) isWrong = true;

    if (q.type === "numeric") {
      if (Math.abs(ans - q.answer) > (q.tolerance || 0)) {
        isWrong = true;
      }
    }

    if (q.type === "multi") {
      const user = ans || [];
      if (
        !(
          user.length === q.correct.length &&
          user.every((v) => q.correct.includes(v))
        )
      ) {
        isWrong = true;
      }
    }

    if (q.type === "text") {
      if (ans?.toLowerCase().trim() !== q.answer.toLowerCase().trim()) {
        isWrong = true;
      }
    }

    if (q.type === "match") {
      if (!q.pairs.every((pair, i) => ans?.[i] === pair.right)) {
        isWrong = true;
      }
    }

    if (isWrong) result.push(q);
  });

  return result;
};
