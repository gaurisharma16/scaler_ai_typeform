"use client";

import { useEffect, useState } from "react";
import type { Question, QuestionType } from "@/lib/types";
import { QUESTION_META } from "@/lib/questionMeta";

interface Props {
  question: Question;
  onChange: (patch: {
    title?: string;
    description?: string | null;
    required?: boolean;
    type?: QuestionType;
    options?: string[];
    settings?: Record<string, unknown>;
  }) => void;
}

const OPTION_TYPES: QuestionType[] = ["multiple_choice", "dropdown"];

export function QuestionEditor({ question, onChange }: Props) {
  const [options, setOptions] = useState<string[]>(question.options.map((o) => o.label));

  useEffect(() => {
    setOptions(question.options.map((o) => o.label));
  }, [question.id]);

  function commitOptions(next: string[]) {
    setOptions(next);
    onChange({ options: next.filter((o) => o.trim().length > 0) });
  }

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">
          Question settings
        </p>
      </div>

      {/* Type selector */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#888]">
          Type
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {QUESTION_META.map((m) => (
            <button
              key={m.type}
              onClick={() => onChange({ type: m.type })}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[12px] font-medium transition-colors ${
                question.type === m.type
                  ? "border-[#191919] bg-[#191919] text-white"
                  : "border-black/10 text-[#555] hover:border-black/20 hover:bg-black/3"
              }`}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
                style={{ backgroundColor: question.type === m.type ? "rgba(255,255,255,0.25)" : m.color }}
              >
                {m.letter}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-black/8" />

      {/* Choices — only for multiple_choice/dropdown */}
      {OPTION_TYPES.includes(question.type) && (
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#888]">
            Choices
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="group flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/5 text-[10px] font-bold text-[#666]">
                  {String.fromCharCode(65 + i)}
                </span>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                  onBlur={() => commitOptions(options)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitOptions([...options, ""]);
                      setTimeout(() => {
                        const inputs = document.querySelectorAll("[data-choice-input]");
                        (inputs[i + 1] as HTMLInputElement)?.focus();
                      }, 50);
                    }
                    if (e.key === "Backspace" && opt === "" && options.length > 1) {
                      e.preventDefault();
                      commitOptions(options.filter((_, idx) => idx !== i));
                    }
                  }}
                  data-choice-input
                  placeholder={`Choice ${i + 1}`}
                  className="flex-1 rounded-xl border border-black/10 px-3 py-1.5 text-[13px] outline-none transition-colors focus:border-[#191919]"
                />
                <button
                  onClick={() => commitOptions(options.filter((_, idx) => idx !== i))}
                  className="rounded-md p-1 text-[#ccc] opacity-0 transition-all group-hover:opacity-100 hover:text-[#E24B4A]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => commitOptions([...options, ""])}
              className="flex items-center gap-1 text-[13px] font-medium text-[#555] hover:text-[#191919]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add choice
            </button>
          </div>
        </div>
      )}

      {/* Rating max */}
      {question.type === "rating" && (
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#888]">
            Number of steps
          </label>
          <div className="flex items-center gap-2">
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const cur = (question.settings?.max_rating as number) || 5;
              return (
                <button
                  key={n}
                  onClick={() => onChange({ settings: { max_rating: n } })}
                  className={`h-8 w-8 rounded-lg text-[13px] font-medium transition-colors ${
                    cur === n
                      ? "bg-[#191919] text-white"
                      : "border border-black/10 text-[#555] hover:border-black/20"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <hr className="border-black/8" />

      {/* Required toggle */}
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/8 px-3 py-3 transition-colors hover:bg-black/2">
        <div>
          <p className="text-[13px] font-medium text-[#191919]">Required</p>
          <p className="text-[11px] text-[#999]">Respondents must answer this question</p>
        </div>
        <div
          className={`relative h-5 w-9 rounded-full transition-colors ${
            question.required ? "bg-[#191919]" : "bg-black/15"
          }`}
          onClick={() => onChange({ required: !question.required })}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              question.required ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </div>
      </label>
    </div>
  );
}
