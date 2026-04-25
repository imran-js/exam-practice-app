const KEY = "dailyProgress";

export const getTodayKey = () => {
  return new Date().toISOString().split("T")[0];
};

export const getDailyProgress = () => {
  return JSON.parse(localStorage.getItem(KEY) || "{}");
};

export const updateDailyProgress = (increment = 1) => {
  const data = getDailyProgress();
  const today = getTodayKey();

  if (!data[today]) {
    data[today] = { completed: 0, goal: 20 };
  }

  data[today].completed += increment;

  localStorage.setItem(KEY, JSON.stringify(data));
};

export const getTodayProgress = () => {
  const data = getDailyProgress();
  const today = getTodayKey();

  return data[today] || { completed: 0, goal: 20 };
};
