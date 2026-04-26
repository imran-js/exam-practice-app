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
