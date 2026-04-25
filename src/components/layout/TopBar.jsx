export default function TopBar({ current, total, children }) {
  return (
    <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      {/* LEFT — Progress */}
      <div className="text-lg font-semibold">
        Question {current} / {total}
      </div>

      {/* <div className="w-full bg-gray-300 h-2">
        <div
          className="bg-blue-500 h-2"
          style={{
            width: `${(current / total) * 100}%`,
          }}
        />
      </div> */}
      {/* RIGHT — Timer */}
      <div>{children}</div>
    </div>
  );
}
