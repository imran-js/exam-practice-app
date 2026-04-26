import { useState, useEffect } from "react";
import useExamState from "./services/hooks/useExamState";
import { loadExamState } from "./services/storage";
import AnalysisPage from "./pages/AnalysisPage";
import ReviewPage from "./pages/ReviewPage";
import ExamPage from "./pages/ExamPage";
import {
  calculateScore,
  analyzePerformance,
  getWrongQuestions,
} from "./core/engine";
import { questions } from "./data/questions";
import { getWeakQuestions } from "./logic/studyMode";
import { updatePerformance } from "./logic/performanceTracker";
import ImportQuestions from "./components/ImportQuestions";
import Dashboard from "./pages/Dashboard";
import { updateSR } from "./logic/spacedRepetition";
import { checkAnswer } from "./core/engine";
import { createStudyActions } from "./core/studyEngine";
import { getStats } from "./core/engine";

export default function App() {
  const { state, updateState, clearExamState } = useExamState();

  const { currentQuestion, answers, flagged, timeLeft, isSubmitted } = state;

  const [reviewMode, setReviewMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState(null);
  const [mode, setMode] = useState("exam");
  // const [uploadedQuestions, setUploadedQuestions] = useState(null);
  const [showResume, setShowResume] = useState(() => {
    const saved = loadExamState();
    return (
      saved && !saved.isSubmitted && Object.keys(saved.answers || {}).length > 0
    );
  });
  const [uploadedQuestions, setUploadedQuestions] = useState(() => {
    const saved = localStorage.getItem("uploadedQuestions");
    return saved ? JSON.parse(saved) : null;
  });
  const [showDashboard, setShowDashboard] = useState(false);

  // ==============================
  // 📚 DATA
  // ==============================
  const baseQuestions = uploadedQuestions || questions;
  const questionSet = activeQuestions || baseQuestions;
  const totalQuestions = questionSet.length;
  const currentQ = questionSet[currentQuestion - 1];
  const {
    startWeakStudy,
    startSmartWeakStudy,
    startSpacedStudy,
    startDifficultyStudy,
  } = createStudyActions({
    questionSet,
    baseQuestions,
    answers,
    setActiveQuestions,
    updateState,
    setReviewMode,
  });

  // ==============================
  // 🧠 PERFORMANCE SAVE (FIXED)
  // ==============================
  useEffect(() => {
    if (isSubmitted && reviewMode && mode === "exam") {
      updatePerformance(questionSet, answers);

      // ✅ SAFE PLACE
      questionSet.forEach((q) => {
        const result = checkAnswer(q, answers);
        updateSR(q.id, result.isCorrect);
      });
    }
  }, [isSubmitted, reviewMode, mode]);

  // ==============================
  // 🚩 FLAG
  // ==============================
  const toggleFlag = () => {
    updateState({
      flagged: flagged.includes(currentQ.id)
        ? flagged.filter((q) => q !== currentQ.id)
        : [...flagged, currentQ.id],
    });
  };

  // ==============================
  // ⏱ TIME UP
  // ==============================
  const handleTimeUp = () => {
    updateState({ isSubmitted: true });
    setReviewMode(true);
  };

  // ==============================
  // 🔄 RESET
  // ==============================
  const resetExam = () => {
    setShowSummary(false);
    setReviewMode(false);
    setActiveQuestions(null);

    clearExamState();
    window.location.reload();
  };

  const clearAllAndRestart = () => {
    if (!window.confirm("Start a new exam? All progress will be lost.")) return;

    clearExamState();

    updateState({
      currentQuestion: 1,
      answers: {},
      flagged: [],
      timeLeft: 5400,
      isSubmitted: false,
    });

    setActiveQuestions(null);
    setReviewMode(false);
    setShowSummary(false);
    setMode("exam"); // ✅ FIXED
    setShowResume(false);
  };

  //   startWeakStudy
  // startSmartWeakStudy
  // startSpacedStudy
  // startDifficultyStudy
  if (showDashboard) {
    return (
      <Dashboard
        onBack={() => setShowDashboard(false)}
        onPracticeTopic={(topic) => {
          const filtered = baseQuestions.filter((q) => q.topic === topic);

          setActiveQuestions(filtered);

          updateState({
            currentQuestion: 1,
            answers: {},
            flagged: [],
            isSubmitted: false,
          });

          setShowDashboard(false);
        }}
      />
    );
  }
  // ==============================
  // 🔁 RESUME SCREEN
  // ==============================
  if (showResume) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-semibold mb-4">Resume previous exam?</h2>

          <div className="flex gap-4 justify-center">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setShowResume(false)}
            >
              Resume
            </button>

            <button
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={() => {
                clearExamState();

                updateState({
                  currentQuestion: 1,
                  answers: {},
                  flagged: [],
                  timeLeft: 5400,
                  isSubmitted: false,
                });

                setActiveQuestions(null);
                setShowResume(false);
              }}
            >
              Start New
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // 📊 REVIEW PAGE
  // ==============================
  if (isSubmitted && reviewMode && !showAnalysis) {
    const score = calculateScore(questionSet, answers);
    const wrongQuestions = getWrongQuestions(questionSet, answers);

    return (
      <ReviewPage
        questionSet={questionSet}
        answers={answers}
        score={score} // ✅ NEW
        wrongQuestions={wrongQuestions} // ✅ NEW
        resetExam={resetExam}
        setActiveQuestions={setActiveQuestions}
        updateState={updateState}
        setReviewMode={setReviewMode}
        setShowAnalysis={setShowAnalysis}
        startSpacedStudy={startSpacedStudy}
        startSmartWeakStudy={startSmartWeakStudy}
        startWeakStudy={startWeakStudy}
        startDifficultyStudy={startDifficultyStudy}
      />
    );
  }

  if (showSummary) {
    const stats = getStats(questionSet, answers, flagged);
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center w-96">
          <h2 className="text-xl font-semibold mb-4">Exam Summary</h2>

          <div className="space-y-2 text-left mb-6">
            <div>Answered: {stats.answered}</div>
            <div>Unanswered: {stats.unanswered}</div>
            <div>Flagged: {stats.flagged}</div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={() => setShowSummary(false)}
            >
              Review Questions
            </button>

            <button
              className="px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => {
                setShowSummary(false);
                updateState({ isSubmitted: true });
                setReviewMode(true);
              }}
            >
              Submit Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // 📊 ANALYSIS
  // ==============================
  if (showAnalysis) {
    const analysis = analyzePerformance(questionSet, answers);
    const history = JSON.parse(localStorage.getItem("examHistory") || "[]");

    return (
      <AnalysisPage
        analysis={analysis}
        history={history}
        onBack={() => setShowAnalysis(false)}
        onPracticeTopic={(topic) => {
          const filtered = questionSet.filter((q) => q.topic === topic);

          setActiveQuestions(filtered);

          updateState({
            currentQuestion: 1,
            answers: {},
            flagged: [],
            isSubmitted: false,
          });

          setShowAnalysis(false);
        }}
      />
    );
  }

  // ==============================
  // 🧪 EXAM PAGE
  // ==============================
  return (
    <>
      <div className="p-4">
        <ImportQuestions
          onLoad={(data) => {
            setUploadedQuestions(data);

            localStorage.setItem("uploadedQuestions", JSON.stringify(data)); // ✅ SAVE

            updateState({
              currentQuestion: 1,
              answers: {},
              flagged: [],
              isSubmitted: false,
            });

            setActiveQuestions(null);
          }}
        />
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("uploadedQuestions");
          setUploadedQuestions(null);
          alert("Cleared uploaded questions");
        }}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm"
      >
        Clear Uploaded Questions
      </button>
      <button
        onClick={() => setShowDashboard(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        📊 Dashboard
      </button>
      <ExamPage
        questionSet={questionSet}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        currentQ={currentQ}
        answers={answers}
        flagged={flagged}
        mode={mode}
        toggleFlag={toggleFlag}
        updateState={updateState}
        setShowSummary={setShowSummary}
        setMode={setMode}
        handleTimeUp={handleTimeUp}
        timeLeft={timeLeft}
        clearAllAndRestart={clearAllAndRestart}
        weakQuestions={getWeakQuestions(questionSet, answers)}
      />
    </>
  );
}
