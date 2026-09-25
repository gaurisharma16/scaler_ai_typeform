"use client";

interface Props {
  current: number;
  total: number;
  color?: string;
}

export function ProgressBar({ current, total, color }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="fixed left-0 right-0 top-0 h-1.5 bg-gray-100">
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color || "#0d0d0d" }}
      />
    </div>
  );
}
