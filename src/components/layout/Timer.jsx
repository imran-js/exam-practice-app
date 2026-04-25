import { useEffect } from "react";

export default function Timer({ timeLeft, onTick }) {
  useEffect(() => {
    const timer = setInterval(() => {
      onTick(); // just signal tick
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-black text-white px-4 py-2 rounded shadow font-mono">
      ⏱ {formatTime(timeLeft)}
    </div>
  );
}
