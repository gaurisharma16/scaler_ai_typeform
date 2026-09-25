"use client";

import { QUESTION_META } from "@/lib/questionMeta";
import type { QuestionType } from "@/lib/types";

const GROUPS = ["Text", "Contact", "Choice"];

export function AddContentMenu({ onPick, onClose }: { onPick: (type: QuestionType) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-12 left-0 z-30 w-[340px] rounded-2xl border border-black/8 bg-white p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[13px] font-semibold text-[#191919]">Add content</p>
        <button onClick={onClose} className="text-[#888] hover:text-[#191919]" aria-label="Close">
          ✕
        </button>
      </div>
      {GROUPS.map((group) => (
        <div key={group} className="mb-2">
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#999]">{group}</p>
          <div className="grid grid-cols-2 gap-1">
            {QUESTION_META.filter((m) => m.group === group).map((m) => (
              <button
                key={m.type}
                onClick={() => onPick(m.type)}
                className="flex items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-black/5"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {m.letter}
                </span>
                <span>
                  <span className="block text-[13px] font-medium text-[#191919]">{m.label}</span>
                  <span className="block text-[11px] text-[#888]">{m.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
