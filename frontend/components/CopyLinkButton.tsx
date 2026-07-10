"use client";

import { useState } from "react";

interface Props {
  roomId: string;
}

export function CopyLinkButton({ roomId }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
    >
      {copied ? "Kopyalandı!" : "Linki Kopyala"}
    </button>
  );
}
