"use client";

import { useEffect, useRef } from "react";
import type { Question } from "@/lib/types";

interface Props {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
  onAdvance: () => void;
  primaryColor: string;
}

export function QuestionField({ question, value, onChange, onAdvance, primaryColor }: Props) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [question.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (question.type === "multiple_choice" && e.key.length === 1) {
        const i = e.key.toUpperCase().charCodeAt(0) - 65;
        if (i >= 0 && i < question.options.length && !e.metaKey && !e.ctrlKey) {
          const tag = (e.target as HTMLElement)?.tagName;
          if (tag === "INPUT" || tag === "TEXTAREA") return;
          e.preventDefault();
          onChange(question.options[i].label);
        }
      }
      if (question.type === "yes_no") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (e.key.toLowerCase() === "y") onChange("yes");
        if (e.key.toLowerCase() === "n") onChange("no");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, onChange]);

  const baseInputClass =
    "w-full border-b-2 bg-transparent pb-3 text-[28px] text-[#191919] placeholder:text-[#ccc] focus:outline-none";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAdvance();
    }
  }

  if (question.settings?.variant === "contact_info") {
    const contactValue = (value && typeof value === "object" ? value : {}) as Record<string, string>;
    const fields = [
      ["first_name", "First name", "Jane"],
      ["last_name", "Last name", "Smith"],
      ["phone", "Phone number", "(201) 555-0123"],
      ["email", "Email", "name@example.com"],
      ["company", "Company", "Acme Corporation"],
    ] as const;

    return (
      <div className="space-y-4">
        {fields.map(([key, label, placeholder], index) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm text-[#555]">{label}</span>
            <input
              autoFocus={index === 0}
              type={key === "email" ? "email" : "text"}
              value={contactValue[key] || ""}
              onChange={(e) => onChange({ ...contactValue, [key]: e.target.value })}
              placeholder={placeholder}
              className={baseInputClass}
              style={{ borderColor: primaryColor }}
            />
          </label>
        ))}
      </div>
    );
  }

  switch (question.type) {
    case "short_text":
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here…"
          className={baseInputClass}
          style={{ borderColor: primaryColor }}
        />
      );

    case "email":
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="email"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="name@example.com"
          className={baseInputClass}
          style={{ borderColor: primaryColor }}
        />
      );

    case "number":
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="number"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a number…"
          className={baseInputClass}
          style={{ borderColor: primaryColor }}
        />
      );

    case "long_text":
      return (
        <div>
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here…"
            rows={3}
            className={`${baseInputClass} resize-none`}
            style={{ borderColor: primaryColor }}
          />
          <p className="mt-2 text-xs text-[#aaa]">Shift ⇧ + Enter ↵ to make a line break</p>
        </div>
      );

    case "multiple_choice":
      return (
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const selected = value === opt.label;
            return (
              <button
                key={opt.id}
                onClick={() => onChange(opt.label)}
                className="flex w-full items-center gap-3 rounded-md border-2 px-4 py-3 text-left text-lg transition"
                style={{
                  borderColor: selected ? primaryColor : `${primaryColor}55`,
                  backgroundColor: selected ? `${primaryColor}14` : "transparent",
                }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded border text-[12px] font-semibold"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      );

    case "dropdown":
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border-2 px-4 py-3 text-lg outline-none"
          style={{ borderColor: primaryColor }}
        >
          <option value="" disabled>
            Select an option…
          </option>
          {question.options.map((opt) => (
            <option key={opt.id} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "yes_no":
      return (
        <div className="flex gap-4">
          {(
            [
              ["yes", "Y", "Yes"],
              ["no", "N", "No"],
            ] as const
          ).map(([v, key, label]) => {
            const selected = value === v;
            return (
              <button
                key={v}
                onClick={() => onChange(v)}
                className="flex items-center gap-3 rounded-md border-2 px-6 py-3 text-lg font-medium transition"
                style={{
                  borderColor: selected ? primaryColor : `${primaryColor}55`,
                  backgroundColor: selected ? `${primaryColor}14` : "transparent",
                }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded border text-[12px] font-semibold"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {key}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      );

    case "rating": {
      const max = (question.settings?.max_rating as number) || 5;
      return (
        <div className="flex gap-2">
          {Array.from({ length: max }).map((_, i) => {
            const n = i + 1;
            const selected = Number(value) >= n;
            return (
              <button
                key={n}
                onClick={() => onChange(n)}
                className="flex h-12 w-12 items-center justify-center rounded-md border-2 text-base font-medium transition"
                style={{
                  borderColor: selected ? primaryColor : `${primaryColor}55`,
                  backgroundColor: selected ? primaryColor : "transparent",
                  color: selected ? "white" : "#191919",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      );
    }

    default:
      return null;
  }
}
