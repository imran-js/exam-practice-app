export const updatePerformance = (questionSet, answers) => {
  const history = JSON.parse(localStorage.getItem("examHistory") || "[]");

  let correct = 0;
  let total = 0;

  questionSet.forEach((q) => {
    if (q.type === "case") {
      q.questions.forEach((sub) => {
        const key = `${q.id}_${sub.subId}`;
        const ans = answers[key];

        if (ans !== undefined) {
          total++;

          if (sub.type === "mcq" && ans === sub.correct) correct++;

          if (sub.type === "numeric") {
            if (Math.abs(ans - sub.answer) <= (sub.tolerance || 0)) {
              correct++;
            }
          }
        }
      });
    } else {
      const ans = answers[q.id];

      if (ans !== undefined) {
        total++;

        if (q.type === "mcq" && ans === q.correct) correct++;

        if (q.type === "numeric") {
          if (Math.abs(ans - q.answer) <= (q.tolerance || 0)) {
            correct++;
          }
        }
      }
    }
  });

  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  const newEntry = {
    date: new Date().toISOString(),
    percentage,
  };

  history.unshift(newEntry); // ✅ ADD to start

  localStorage.setItem("examHistory", JSON.stringify(history));
};
