const STORAGE_KEY = "spacedData";

export const loadSR = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
};

export const saveSR = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const updateSR = (id, isCorrect) => {
  const data = JSON.parse(localStorage.getItem("spacedData") || "{}");

  if (!data[id]) {
    data[id] = { interval: 1, last: Date.now() };
  }

  if (isCorrect) {
    data[id].interval = Math.min(data[id].interval * 2, 30);
  } else {
    data[id].interval = 1;
  }

  data[id].last = Date.now();

  localStorage.setItem("spacedData", JSON.stringify(data));
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
