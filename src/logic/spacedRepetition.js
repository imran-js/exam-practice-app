const STORAGE_KEY = "spacedData";

export const loadSR = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
};

export const saveSR = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateSR = (questionId, isCorrect) => {
  console.log("SR UPDATE:", questionId, {
    isCorrect,
    interval: q.interval,
    ease: q.ease,
    due: new Date(q.due).toLocaleString(),
  });
  const data = loadSR();

  const now = Date.now();

  const q = data[questionId] || {
    ease: 2.5,
    interval: 1,
    due: now,
  };

  if (isCorrect) {
    q.interval = Math.round(q.interval * q.ease);
    q.ease = Math.min(q.ease + 0.1, 3);
  } else {
    q.interval = 1;
    q.ease = Math.max(q.ease - 0.2, 1.3);
  }

  q.due = now + q.interval * 24 * 60 * 60 * 1000;

  data[questionId] = q;

  saveSR(data);
};

export const getDueQuestions = (questions) => {
  const data = loadSR(); // ✅ declared once, outside
  const now = Date.now();

  return questions.filter((q) => {
    const item = data[q.id];

    // New question → show
    if (!item) return true;

    // Wrong questions (interval = 1) → show immediately
    if (item.interval === 1) return true;

    // Correct questions → only when due
    return item.due <= now;
  });
};
