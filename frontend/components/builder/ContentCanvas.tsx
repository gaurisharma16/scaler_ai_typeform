"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/types";
import { LivePreview } from "@/components/builder/LivePreview";
import { QUESTION_META_BY_TYPE } from "@/lib/questionMeta";

export function ContentCanvas({
  question,
  allQuestions,
  activeIndex,
  formTitle,
  primaryColor,
  onSelectIndex,
  onChange,
}: {
  question: Question | null;
  allQuestions: Question[];
  activeIndex: number;
  formTitle: string;
  primaryColor: string;
  onSelectIndex: (i: number) => void;
  onChange: (patch: {
    title?: string;
    description?: string | null;
    required?: boolean;
  }) => void;
}) {
  const [title, setTitle] = useState(question?.title || "");
  const [description, setDescription] = useState(question?.description || "");
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(question?.title || "");
    setDescription(question?.description || "");
    // Focus the title input whenever question changes
    setTimeout(() => titleRef.current?.focus(), 60);
  }, [question?.id]);

  // Build a "live" copy of allQuestions with the current unsaved edits
  // so the preview stays reactive as the user types.
  const liveQuestions = allQuestions.map((q) =>
    q.id === question?.id ? { ...q, title, description: description || null } : q
  );

  if (!question) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <p className="text-sm text-[#aaa]">Add a question to start building your form.</p>
      </div>
    );
  }

  const meta = QUESTION_META_BY_TYPE[question.type];

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center px-8 py-10">
      {/* Question type pill */}
      <div className="mb-6 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white"
          style={{ backgroundColor: meta?.color ?? "#888" }}
        >
          {meta?.letter}
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">
          {activeIndex + 1} · {meta?.label}
        </span>
        {question.required && (
          <span className="rounded-full bg-[#FFE5E5] px-2 py-0.5 text-[10px] font-semibold text-[#E24B4A]">
            Required
          </span>
        )}
      </div>

      {/* Title auto-resize textarea */}
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";
        }}
        onBlur={() => onChange({ title })}
        rows={1}
        className="w-full resize-none overflow-hidden bg-transparent text-[32px] font-semibold leading-tight tracking-tight outline-none placeholder:text-[#ccc]"
        placeholder="Your question here"
        style={{ minHeight: "44px" }}
      />

      {/* Description */}
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => onChange({ description: description || null })}
        className="mt-3 w-full bg-transparent text-[15px] text-[#888] outline-none placeholder:text-[#d0cdc7]"
        placeholder="Description (optional)"
      />

      {/* Divider */}
      <div className="my-8 border-t border-black/5" />

      {/* Live preview */}
      <div className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/8">
        <LivePreview
          title={formTitle}
          questions={liveQuestions}
          activeIndex={activeIndex}
          onSelectIndex={onSelectIndex}
          primaryColor={primaryColor}
          chrome={true}
        />
      </div>

      <p className="mt-3 text-center text-[11px] text-[#ccc]">
        Live preview · use the right panel to change question settings
      </p>
    </div>
  );
}
