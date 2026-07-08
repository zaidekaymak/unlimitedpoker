"use client";

import { FIBONACCI } from "@/lib/constants";

interface CardDeckProps {
  selectedValue: string | null;
  hasVoted: boolean;
  revealed: boolean;
  onVote: (value: string) => void;
}

export function CardDeck({ selectedValue, hasVoted, revealed, onVote }: CardDeckProps) {
  if (revealed) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 p-4">
      {FIBONACCI.map((value) => {
        const isSelected = selectedValue === value;
        return (
          <button
            key={value}
            onClick={() => !hasVoted && onVote(value)}
            disabled={hasVoted}
            className={`
              w-16 h-24 rounded-xl border-2 text-xl font-bold
              flex items-center justify-center
              transition-all duration-150 select-none
              ${isSelected
                ? "border-indigo-500 bg-indigo-100 text-indigo-700 scale-110 shadow-lg"
                : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:scale-105"
              }
              ${hasVoted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
