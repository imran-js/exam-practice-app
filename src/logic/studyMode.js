export const getWeakQuestions = (questionSet, answers) => {
  return questionSet.filter((q) => {
    // unanswered = weak
    const ans = answers[q.id];

    if (ans === undefined) return true;

    // MCQ
    if (q.type === "mcq") return ans !== q.correct;

    // NUMERIC
    if (q.type === "numeric") {
      return Math.abs(ans - q.answer) > (q.tolerance || 0);
    }

    // MULTI
    if (q.type === "multi") {
      const user = ans || [];
      return !(
        user.length === q.correct.length &&
        user.every((v) => q.correct.includes(v))
      );
    }

    // TEXT
    if (q.type === "text") {
      return ans?.toLowerCase().trim() !== q.answer.toLowerCase().trim();
    }

    // MATCH
    if (q.type === "match") {
      return !q.pairs.every((pair, i) => ans?.[i] === pair.right);
    }

    // CASE
    if (q.type === "case") {
      return q.questions.some((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const subAns = answers[key];

        if (subAns === undefined) return true;

        if (sub.type === "mcq") return subAns !== sub.correct;

        if (sub.type === "numeric") {
          return Math.abs(subAns - sub.answer) > (sub.tolerance || 0);
        }

        return false;
      });
    }

    return false;
  });
};

export const getSmartWeakQuestions = (questionSet, answers) => {
  return questionSet.filter((q) => {
    const ans = answers[q.id];

    // prioritize wrong but answered
    if (ans === undefined) return false;

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

    if (q.type === "case") {
      return q.questions.some((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const subAns = answers[key];

        if (subAns === undefined) return false;

        if (sub.type === "mcq") return subAns !== sub.correct;

        if (sub.type === "numeric") {
          return Math.abs(subAns - sub.answer) > (sub.tolerance || 0);
        }

        return false;
      });
    }

    return false;
  });
};
