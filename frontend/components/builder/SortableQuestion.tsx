"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Question } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";
import { QUESTION_META_BY_TYPE } from "@/lib/questionMeta";

interface Props {
  question: Question;
  index: number;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function SortableQuestion({ question, index, active, onSelect, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms cubic-bezier(0.22,1,0.36,1)",
    zIndex: isDragging ? 50 : undefined,
  };

  const meta = QUESTION_META_BY_TYPE[question.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex cursor-pointer items-center gap-2 rounded-[10px] px-2.5 py-2.5 text-sm transition-colors select-none ${
        isDragging
          ? "opacity-40 shadow-lg bg-white ring-2 ring-[#FF6B5E]/30"
          : active
          ? "bg-[#f5f3ef] shadow-sm"
          : "hover:bg-[#f5f3ef]/60"
      }`}
      onClick={onSelect}
    >
      {/* Active indicator */}
      {active && !isDragging && (
        <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#FF6B5E]" />
      )}

      {/* Drag handle */}
      <span
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center text-[#C9C6BC] opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        {/* GripVertical icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5"/>
          <circle cx="15" cy="5" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/>
          <circle cx="15" cy="12" r="1.5"/>
          <circle cx="9" cy="19" r="1.5"/>
          <circle cx="15" cy="19" r="1.5"/>
        </svg>
      </span>

      {/* Type color badge */}
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white"
        style={{ backgroundColor: meta?.color ?? "#888" }}
      >
        {meta?.letter ?? "?"}
      </span>

      <span className="w-5 shrink-0 text-[11px] font-medium text-[#B0AC9E]">{index + 1}</span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] font-medium ${active ? "text-[#191919]" : "text-[#3a3a3a]"}`}>
          {question.title || "Untitled question"}
        </p>
        <p className="mt-0.5 truncate text-[10px] uppercase tracking-wider text-[#8A877D]">
          {question.settings?.variant === "contact_info" ? "Contact info" : QUESTION_TYPE_LABELS[question.type]}
          {question.required && <span className="ml-1 text-[#FF6B5E]">*</span>}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="rounded-md p-1 text-[#C9C6BC] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#FFE5E5] hover:text-[#E24B4A]"
        aria-label="Delete question"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}
