"use client";

import { useState, useRef, useEffect } from "react";

const MODES = [
  {
    key: "universal",
    label: "Universal mode",
    desc: "Create any form.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="1.5"/>
        <rect x="13" y="3" width="8" height="8" rx="1.5"/>
        <rect x="3" y="13" width="8" height="8" rx="1.5"/>
        <rect x="13" y="13" width="8" height="8" rx="1.5"/>
      </svg>
    ),
    soon: false,
  },
  {
    key: "lead",
    label: "Lead qualification mode",
    desc: "Score and prioritize leads.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    soon: false,
  },
  {
    key: "knowledge",
    label: "Knowledge quiz mode",
    desc: "Set correct answers.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4"/>
        <circle cx="12" cy="12" r="9"/>
      </svg>
    ),
    soon: true,
  },
  {
    key: "match",
    label: "Match quiz mode",
    desc: "Assign answers to endings.",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7H4M20 12H4M20 17H4" />
        <circle cx="2" cy="7" r="1" fill="currentColor"/>
        <circle cx="2" cy="12" r="1" fill="currentColor"/>
        <circle cx="2" cy="17" r="1" fill="currentColor"/>
      </svg>
    ),
    soon: true,
  },
] as const;

type ModeKey = (typeof MODES)[number]["key"];

export function UniversalModeSelect() {
  const [active, setActive] = useState<ModeKey>("universal");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = MODES.find((m) => m.key === active) ?? MODES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium text-[#191919] shadow-sm transition-colors hover:bg-[#f5f3ef] ${
          open ? "border-[#191919]" : ""
        }`}
      >
        <span className="text-[#555]">{current.icon}</span>
        {current.label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`text-[#888] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-64 overflow-hidden rounded-2xl border border-black/8 bg-white py-1.5 shadow-xl ring-1 ring-black/5">
          {MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => {
                if (!mode.soon) {
                  setActive(mode.key);
                  setOpen(false);
                }
              }}
              disabled={mode.soon}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                mode.soon
                  ? "cursor-default opacity-50"
                  : "hover:bg-[#f5f3ef]"
              } ${mode.key === active ? "bg-[#f5f3ef]" : ""}`}
            >
              <span className={`mt-0.5 ${mode.key === active ? "text-[#191919]" : "text-[#888]"}`}>
                {mode.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#191919]">{mode.label}</p>
                <p className="text-[12px] text-[#888]">{mode.desc}</p>
              </div>
              {mode.soon && (
                <span className="mt-0.5 rounded-full border border-[#c9b6f0] bg-[#f4f0ff] px-1.5 py-0.5 text-[9px] font-semibold text-[#7c59e0]">
                  Pro
                </span>
              )}
              {mode.key === active && !mode.soon && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#191919" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
