"use client";

interface AdminControlsProps {
  revealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export function AdminControls({ revealed, onReveal, onReset }: AdminControlsProps) {
  return (
    <div className="flex gap-3 justify-center">
      {!revealed ? (
        <button
          onClick={onReveal}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
        >
          Kartları Aç 🃏
        </button>
      ) : (
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
        >
          Yeni Tur 🔄
        </button>
      )}
    </div>
  );
}
