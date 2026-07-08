"use client";

import { ConnectionStatus } from "@/hooks/usePokerRoom";

const statusConfig: Record<ConnectionStatus, { label: string; className: string }> = {
  connecting: { label: "Bağlanıyor...", className: "bg-yellow-100 text-yellow-800" },
  open: { label: "Bağlı", className: "bg-green-100 text-green-800" },
  closed: { label: "Bağlantı kesildi", className: "bg-red-100 text-red-800" },
  error: { label: "Hata", className: "bg-red-100 text-red-800" },
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
