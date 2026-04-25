const STORAGE_KEY = "exam_state_v1";

export const loadExamState = () => {
  const data = localStorage.getItem("exam_state_v1");
  return data ? JSON.parse(data) : null;
};

export const saveExamState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// export const loadExamState = () => {
//   const data = localStorage.getItem(STORAGE_KEY);
//   return data ? JSON.parse(data) : null;
// };

export const clearExamState = () => {
  localStorage.removeItem(STORAGE_KEY);
};
