"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  createQuestion,
  deleteQuestion,
  getForm,
  getLogic,
  publishForm,
  reorderQuestions,
  unpublishForm,
  updateForm,
  updateQuestion,
  updateQuestionPosition,
} from "@/lib/api";
import type { FormDetail, LogicRule, Question, QuestionType } from "@/lib/types";
import { SortableQuestion } from "@/components/builder/SortableQuestion";
import { QuestionEditor } from "@/components/builder/QuestionEditor";
import { WorkflowCanvas } from "@/components/builder/WorkflowCanvas";
import { ComingSoon } from "@/components/builder/ComingSoon";
import { ShareModal } from "@/components/builder/ShareModal";
import { AddContentModal } from "@/components/builder/AddContentModal";
import { UniversalModeSelect } from "@/components/builder/UniversalModeSelect";
import { ContentCanvas } from "@/components/builder/ContentCanvas";
import { DesignPanel } from "@/components/builder/DesignPanel";
import { useToast } from "@/components/ui/Toast";
import { QUESTION_TYPE_LABELS } from "@/lib/types";
import { QUESTION_META_BY_TYPE } from "@/lib/questionMeta";

type BuilderTab = "content" | "workflow" | "connect";

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const formId = Number(id);
  const { showToast } = useToast();

  const [form, setForm] = useState<FormDetail | null>(null);
  const [logic, setLogic] = useState<LogicRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [tab, setTab] = useState<BuilderTab>("content");
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function refresh() {
    try {
      const data = await getForm(formId);
      setForm(data);
      setLogic(await getLogic(formId));
      setTitleDraft(data.title);
      setActiveId((prev) => {
        if (prev && data.questions.some((q) => q.id === prev)) return prev;
        return data.questions[0]?.id ?? null;
      });
    } catch {
      showToast("Failed to load form", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  if (loading || !form) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-[#aaa]">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  const activeQuestion = form.questions.find((q) => q.id === activeId) || null;
  const activeIndex = form.questions.findIndex((q) => q.id === activeId);
  const draggingQuestion = form.questions.find((q) => q.id === draggingId) || null;
  const primaryColor = (form.theme?.primaryColor as string) || form.theme_color || "#FF6B5E";

  async function handleAddQuestion(type: QuestionType, settings?: Record<string, unknown>) {
    setAddOpen(false);
    try {
      const q = await createQuestion(formId, {
        type,
        title: settings?.variant === "contact_info" ? "Contact Info" : "",
        description: settings?.variant === "contact_info" ? "Tell us a little about yourself" : undefined,
        settings,
        options: type === "multiple_choice" || type === "dropdown" ? ["Choice A", "Choice B"] : undefined,
      });
      await refresh();
      setActiveId(q.id);
      setTab("content");
    } catch {
      showToast("Could not add question", "error");
    }
  }

  interface QuestionPatch {
    title?: string;
    description?: string | null;
    required?: boolean;
    type?: QuestionType;
    options?: string[];
    settings?: Record<string, unknown>;
  }

  async function handleQuestionChange(question: Question, patch: QuestionPatch) {
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== question.id) return q;
          const { options, ...rest } = patch;
          return {
            ...q,
            ...rest,
            options: options
              ? options.map((label, i) => ({ id: -1 - i, label, order_index: i }))
              : q.options,
          };
        }),
      };
    });
    try {
      await updateQuestion(question.id, patch);
      refresh();
    } catch {
      showToast("Could not save question", "error");
      refresh();
    }
  }

  async function handleDeleteQuestion(question: Question) {
    if (!form) return;
    try {
      await deleteQuestion(question.id);
      if (activeId === question.id) {
        const idx = form.questions.findIndex((q) => q.id === question.id);
        const next = form.questions[idx + 1] ?? form.questions[idx - 1];
        setActiveId(next?.id ?? null);
      }
      showToast("Question deleted");
      refresh();
    } catch {
      showToast("Could not delete question", "error");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(Number(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !form) return;

    const oldIndex = form.questions.findIndex((q) => q.id === active.id);
    const newIndex = form.questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(form.questions, oldIndex, newIndex);
    setForm({ ...form, questions: reordered });

    try {
      await reorderQuestions(formId, reordered.map((q) => q.id));
    } catch {
      showToast("Could not reorder questions", "error");
      refresh();
    }
  }

  async function handleWorkflowMove(questionId: number, x: number, y: number) {
    try {
      await updateQuestionPosition(questionId, x, y);
    } catch {
      showToast("Could not save workflow position", "error");
    }
  }

  async function handleTitleBlur() {
    if (!form) return;
    if (titleDraft.trim() && titleDraft !== form.title) {
      try {
        await updateForm(formId, { title: titleDraft.trim() });
        refresh();
      } catch {
        showToast("Could not rename form", "error");
      }
    }
  }

  async function handleTogglePublish() {
    if (!form) return;
    try {
      if (form.status === "published") {
        await unpublishForm(formId);
        showToast("Unpublished");
      } else {
        await publishForm(formId);
        showToast("Published — share link is live 🎉");
        setShareOpen(true);
      }
      refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update status", "error");
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#f7f7f4] text-[#191919]">
      {/* Top nav */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-black/8 bg-white px-4">
        <div className="flex items-center gap-2 text-[13px]">
          <Link href="/forms" className="text-[#666] transition-colors hover:text-[#191919]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <span className="text-[#ddd]">|</span>
          <input
            ref={titleRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && titleRef.current?.blur()}
            className="w-52 bg-transparent text-[13px] font-semibold outline-none truncate"
            title="Click to rename"
          />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-0.5 rounded-full bg-black/5 p-0.5">
          {(["content", "workflow", "connect"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-[12px] font-medium capitalize transition-all ${
                tab === t ? "bg-white text-[#191919] shadow-sm" : "text-[#777] hover:text-[#555]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {form.status === "published" && form.share_slug && (
            <a
              href={`/f/${form.share_slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-[#555] transition-colors hover:bg-black/5 hover:text-[#191919]"
            >
              Preview
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          )}
          <button
            onClick={() => setShareOpen(true)}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium text-[#555] transition-colors hover:bg-black/5 hover:text-[#191919]"
          >
            Share
          </button>
          <button
            onClick={handleTogglePublish}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold text-white transition-all ${
              form.status === "published"
                ? "bg-[#1a7f4b] hover:bg-[#166b3f]"
                : "bg-[#191919] hover:bg-[#333]"
            }`}
          >
            {form.status === "published" ? (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                Published
              </span>
            ) : (
              "Publish"
            )}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9b6f0] text-[11px] font-bold text-[#5b3eb5] select-none">
            YO
          </div>
        </div>
      </header>

      {/* Content tab */}
      {tab === "content" && (
        <>
          {/* Secondary toolbar */}
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-black/8 bg-white px-4">
            <UniversalModeSelect />

            <div className="mx-1 h-5 w-px bg-black/10" />

            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#191919] px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-80"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add content
            </button>

            <button
              onClick={() => setDesignOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                designOpen ? "bg-black/10 text-[#191919]" : "text-[#555] hover:bg-black/5"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
              </svg>
              Design
            </button>

            <div className="ml-auto flex items-center gap-3 text-[12px] text-[#888]">
              <Link href={`/forms/${formId}/results`} className="flex items-center gap-1 transition-colors hover:text-[#191919]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
                Results
              </Link>
            </div>
          </div>

          {/* Three-panel layout */}
          <div className="grid flex-1 grid-cols-[260px_1fr_280px] overflow-hidden">
            {/* Left: question list */}
            <aside className="flex flex-col gap-3 overflow-y-auto p-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#888]">
                  Pages
                  <span className="ml-1.5 rounded-full bg-black/8 px-1.5 py-0.5 text-[10px] text-[#666]">
                    {form.questions.length}
                  </span>
                </p>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={form.questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-0.5">
                      {form.questions.map((q, i) => (
                        <SortableQuestion
                          key={q.id}
                          question={q}
                          index={i}
                          active={q.id === activeId}
                          onSelect={() => setActiveId(q.id)}
                          onDelete={() => handleDeleteQuestion(q)}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {/* Drag overlay for polished drag preview */}
                  <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.22,1,0.36,1)" }}>
                    {draggingQuestion && (
                      <div className="flex cursor-grabbing items-center gap-2 rounded-[10px] bg-white px-2.5 py-2.5 shadow-xl ring-1 ring-black/10 text-[13px] font-medium">
                        <svg className="text-[#888]" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
                          <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                          <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
                        </svg>
                        <span className="text-[11px] text-[#B0AC9E]">
                          {form.questions.indexOf(draggingQuestion) + 1}.
                        </span>
                        {draggingQuestion.title || "Untitled question"}
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>

                <button
                  onClick={() => setAddOpen(true)}
                  className="mt-2 flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-[13px] text-[#888] transition-colors hover:bg-black/5 hover:text-[#191919]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add question
                </button>
              </div>

              {/* Endings */}
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#888]">Endings</p>
                <div className="rounded-xl px-2 py-2 hover:bg-black/3 cursor-pointer">
                  <p className="text-[13px] font-medium text-[#191919]">{form.thank_you_message || "Thank you"}</p>
                  <p className="text-[11px] text-[#aaa]">Default ending</p>
                </div>
              </div>

              {/* AI assistant button */}
              <button className="rounded-2xl border border-black/8 bg-white px-3 py-3 text-left text-[13px] shadow-sm ring-1 ring-black/5 transition-colors hover:bg-[#f9f7f4]">
                <p className="font-medium">✦ Ask Typeform AI</p>
                <p className="mt-0.5 text-[11px] text-[#aaa]">Generate questions automatically</p>
              </button>
            </aside>

            {/* Center: canvas */}
            <main className="overflow-y-auto bg-white">
              {designOpen ? (
                <DesignPanel
                  form={form}
                  onSave={async (patch) => {
                    try {
                      const updated = await updateForm(formId, patch);
                      setForm(updated);
                      showToast("Design saved");
                    } catch {
                      showToast("Could not save design", "error");
                    }
                  }}
                />
              ) : (
                <ContentCanvas
                  question={activeQuestion}
                  allQuestions={form.questions}
                  activeIndex={activeIndex === -1 ? 0 : activeIndex}
                  formTitle={form.title}
                  primaryColor={primaryColor}
                  onSelectIndex={(i) => setActiveId(form.questions[i]?.id ?? null)}
                  onChange={(patch) => activeQuestion && handleQuestionChange(activeQuestion, patch)}
                />
              )}
            </main>

            {/* Right: editor */}
            <aside className="flex flex-col overflow-y-auto border-l border-black/8 bg-white">
              <div className="flex-1 p-4">
                {activeQuestion ? (
                  <QuestionEditor
                    key={activeQuestion.id}
                    question={activeQuestion}
                    onChange={(patch) => handleQuestionChange(activeQuestion, patch)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-[13px] text-[#aaa]">
                      Select a question<br />to edit settings.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </>
      )}

      {tab === "workflow" && (
        <div className="flex-1 overflow-hidden">
          <WorkflowCanvas
            questions={form.questions}
            logic={logic}
            activeId={activeId}
            onSelect={setActiveId}
            onMove={handleWorkflowMove}
          />
        </div>
      )}

      {tab === "connect" && (
        <div className="flex-1">
          <ComingSoon
            title="Integrations & webhooks"
            body="Connect to Slack, Google Sheets, HubSpot, and custom webhooks. Placeholder for the assignment."
          />
        </div>
      )}

      <AddContentModal open={addOpen} onClose={() => setAddOpen(false)} onPick={handleAddQuestion} />
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        slug={form.share_slug}
        published={form.status === "published"}
      />
    </div>
  );
}
