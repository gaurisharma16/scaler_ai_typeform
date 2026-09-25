"use client";

import type { Question } from "@/lib/types";

interface Props {
  title?: string;
  questions: Question[];
  activeIndex: number;
  onSelectIndex?: (i: number) => void;
  primaryColor?: string;
  chrome?: boolean;
  accent?: string;
}

function QuestionPreview({ question, accent }: { question: Question; accent: string }) {
  if (question.settings?.variant === "contact_info") {
    return (
      <div className="space-y-1.5">
        {["First name", "Last name", "Phone number", "Email", "Company"].map((label) => (
          <div key={label} className="border-b-2 pb-1.5 text-[13px] text-white/40" style={{ borderColor: `${accent}66` }}>
            {label}
          </div>
        ))}
      </div>
    );
  }

  switch (question.type) {
    case "short_text":
    case "email":
    case "number":
      return (
        <div
          className="border-b-2 pb-1.5 text-[15px] text-white/30"
          style={{ borderColor: `${accent}66` }}
        >
          {question.type === "email" ? "name@example.com" : "Type your answer…"}
        </div>
      );
    case "long_text":
      return (
        <div className="h-12 border-b-2 text-[15px] text-white/30" style={{ borderColor: `${accent}66` }}>
          Type your answer…
        </div>
      );
    case "multiple_choice":
      return (
        <div className="space-y-1.5">
          {question.options.slice(0, 4).map((o, i) => (
            <div
              key={o.id}
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12px]"
              style={{ borderColor: `${accent}44` }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[9px] font-bold"
                style={{ borderColor: accent, color: accent }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-white/80 truncate">{o.label}</span>
            </div>
          ))}
          {question.options.length > 4 && (
            <p className="text-[10px] text-white/30 pl-1">+{question.options.length - 4} more…</p>
          )}
        </div>
      );
    case "dropdown":
      return (
        <div
          className="flex items-center justify-between rounded-md border px-3 py-2 text-[12px] text-white/40"
          style={{ borderColor: `${accent}44` }}
        >
          <span>Select an option…</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      );
    case "yes_no":
      return (
        <div className="flex gap-2">
          {["Y Yes", "N No"].map((label) => (
            <div
              key={label}
              className="rounded-md border px-4 py-2 text-[12px] text-white/70"
              style={{ borderColor: `${accent}44` }}
            >
              {label}
            </div>
          ))}
        </div>
      );
    case "rating": {
      const max = (question.settings?.max_rating as number) || 5;
      return (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-md border text-[11px] text-white/60"
              style={{ borderColor: `${accent}44` }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}

export function LivePreview({
  questions,
  activeIndex,
  primaryColor = "#FF6B5E",
  chrome = true,
}: Props) {
  const question = questions[activeIndex];
  const accent = primaryColor;
  const progress = questions.length ? ((activeIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="flex h-64 flex-col overflow-hidden rounded-2xl bg-[#191919] text-white shadow-sm">
      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: accent }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center px-7 py-5">
        {!question ? (
          <p className="text-[13px] text-white/30">Add a question to preview.</p>
        ) : (
          <div>
            <p className="mb-2 flex items-center gap-1 text-[11px] font-semibold" style={{ color: accent }}>
              <span>{activeIndex + 1}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
              {question.required && <span>*</span>}
            </p>
            <h3 className="mb-1 text-[18px] font-semibold leading-snug">
              {question.title || <span className="text-white/30 italic">Untitled question</span>}
            </h3>
            {question.description && (
              <p className="mb-3 text-[12px] text-white/50">{question.description}</p>
            )}
            <div className="mt-4">
              <QuestionPreview question={question} accent={accent} />
            </div>
            <button
              className="mt-4 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-white"
              style={{ backgroundColor: accent }}
            >
              OK <span className="opacity-80">✓</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav dots (if multiple questions) */}
      {questions.length > 1 && (
        <div className="flex items-center justify-center gap-1 pb-3">
          {questions.slice(0, Math.min(8, questions.length)).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === activeIndex ? "16px" : "4px",
                backgroundColor: i === activeIndex ? accent : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
          {questions.length > 8 && (
            <span className="ml-1 text-[10px] text-white/30">+{questions.length - 8}</span>
          )}
        </div>
      )}
    </div>
  );
}
