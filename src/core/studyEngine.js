import { getWeakQuestions, getSmartWeakQuestions } from "../logic/studyMode";
import { getDueQuestions } from "../logic/spacedRepetition";
import { getDifficulty } from "../logic/difficulty";

export const createStudyActions = ({
  questionSet,
  baseQuestions,
  answers,
  setActiveQuestions,
  updateState,
  setReviewMode,
}) => {
  const resetState = () => {
    updateState({
      currentQuestion: 1,
      answers: {},
      flagged: [],
      isSubmitted: false,
    });

    setReviewMode(false);
  };

  const startWeakStudy = () => {
    const weak = getWeakQuestions(questionSet, answers);

    if (weak.length === 0) {
      alert("🔥 You’ve mastered everything!");
      return;
    }

    setActiveQuestions(weak);
    resetState();
  };

  const startSmartWeakStudy = () => {
    const smart = getSmartWeakQuestions(questionSet, answers);

    if (smart.length === 0) {
      alert("🔥 Nothing to study — you're doing great!");
      return;
    }

    setActiveQuestions(smart);
    resetState();
  };

  const startSpacedStudy = () => {
    const due = getDueQuestions(baseQuestions);

    if (due.length === 0) {
      alert("🔥 Nothing due — you're on track!");
      return;
    }

    setActiveQuestions(due);
    resetState();
  };

  const startDifficultyStudy = (level) => {
    const filtered = questionSet.filter((q) => getDifficulty(q.id) === level);

    if (filtered.length === 0) {
      alert(`No ${level} questions found`);
      return;
    }

    setActiveQuestions(filtered);
    resetState();
  };

  return {
    startWeakStudy,
    startSmartWeakStudy,
    startSpacedStudy,
    startDifficultyStudy,
  };
};
