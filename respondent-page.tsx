"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ApiError, getPublicForm, saveAnswer, startResponse, submitResponse } from "@/lib/api";
import type { PublicForm } from "@/lib/types";
import { ProgressBar } from "@/components/respondent/ProgressBar";
import { QuestionField } from "@/components/respondent/QuestionField";

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 56 : -56 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -56 : 56 }),
};

const TRANSITION = { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const };

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<PublicForm | null>(null);
  const [responseId, setResponseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicForm(slug);
        setForm(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  async function handleStart() {
    if (!form) return;
    setStartError(null);
    try {
      const { response_id } = await startResponse(slug);
      setResponseId(response_id);
      setStarted(true);
    } catch {
      setStartError("Could not start this form. Please try again.");
    }
  }

  const question = form?.questions[index];
  const primaryColor = (form?.theme?.primaryColor as string) || form?.theme_color || "#FF6B5E";

  const goNext = useCallback(async () => {
    if (!form || !question || !responseId || saving) return;
    setError(null);

    // Validate required
    if (question.required) {
      const val = answers[question.id];
      if (val === undefined || val === null || val === "") {
        setError("This question requires an answer.");
        return;
      }
    }

    const value = answers[question.id];

    setSaving(true);
    try {
      await saveAnswer(responseId, question.id, value ?? null);
    } catch (e) {
      setSaving(false);
      setError(e instanceof ApiError ? e.message : "Could not save your answer.");
      return;
    }
    setSaving(false);

    if (index < form.questions.length - 1) {
      setDirection(1);
      setIndex((i) => i + 1);
    } else {
      setSubmitting(true);
      try {
        await submitResponse(responseId);
        router.push(
          `/f/${slug}/thank-you?msg=${encodeURIComponent(form.thank_you_message || "")}`
        );
      } catch {
        setSubmitting(false);
        setError("Something went wrong submitting your response. Please try again.");
      }
    }
  }, [form, question, responseId, answers, index, saving, router, slug]);

  const goBack = useCallback(() => {
    if (index === 0) return;
    setError(null);
    setDirection(-1);
    setIndex((i) => i - 1);
  }, [index]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!started) {
        if (e.key === "Enter") handleStart();
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (tag !== "TEXTAREA" && tag !== "SELECT") {
          e.preventDefault();
          goNext();
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goBack();
      } else if (
        e.key === "Enter" &&
        tag !== "TEXTAREA" &&
        tag !== "SELECT"
      ) {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, goNext, goBack]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#191919]">
        <div className="flex items-center gap-2 text-[#555]">
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#191919] px-6 text-center text-white">
        <p className="text-xl font-semibold">This form isn&apos;t available</p>
        <p className="mt-2 text-[#666]">It may be unpublished or the link is incorrect.</p>
      </div>
    );
  }

  // Welcome screen
  if (!started) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#191919", color: "white" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <h1 className="text-[44px] font-semibold leading-tight tracking-tight sm:text-[56px]">
            {form.welcome_title || form.title}
          </h1>
          {form.welcome_desc && (
            <p className="mt-4 text-[18px] text-white/60">{form.welcome_desc}</p>
          )}
          <p className="mt-6 text-[14px] text-[#555]">
            {form.questions.length} question{form.questions.length !== 1 ? "s" : ""} · press{" "}
            <kbd className="rounded-md border border-[#333] bg-[#222] px-1.5 py-0.5 text-[12px] font-mono">
              Enter ↵
            </kbd>
          </p>
          <button
            onClick={handleStart}
            className="mt-8 rounded-lg px-8 py-3.5 text-[16px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            Start →
          </button>
          {startError && <p className="mt-4 text-[13px] text-[#E24B4A]">{startError}</p>}
        </motion.div>
      </div>
    );
  }

  // Form fill
  return (
    <div className="relative flex h-screen flex-col overflow-hidden" style={{ backgroundColor: "#191919", color: "white" }}>
      {/* Progress bar */}
      <ProgressBar current={index + (submitting ? 1 : 0)} total={form.questions.length} color={primaryColor} />

      {/* Question area */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-6">
        <AnimatePresence mode="wait" custom={direction}>
          {question && (
            <motion.div
              key={question.id}
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={TRANSITION}
              className="w-full max-w-xl"
            >
              {/* Q number */}
              <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: primaryColor }}>
                <span>{index + 1}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
                {question.required && (
                  <span title="Required" style={{ color: primaryColor }}>*</span>
                )}
              </p>

              {/* Title */}
              <h2 className="mb-1 text-[34px] font-semibold leading-tight tracking-tight text-white">
                {question.title}
              </h2>

              {/* Description */}
              {question.description && (
                <p className="mb-6 text-[16px] text-white/55">{question.description}</p>
              )}

              {/* Input */}
              <div className="mt-8 [&_input]:text-white [&_textarea]:text-white [&_input]:placeholder:text-white/30 [&_textarea]:placeholder:text-white/30">
                <QuestionField
                  question={question}
                  value={answers[question.id]}
                  onChange={(v) => {
                    setAnswers((prev) => ({ ...prev, [question.id]: v }));
                    setError(null);
                  }}
                  onAdvance={goNext}
                  primaryColor={primaryColor}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-[13px] text-[#E24B4A]"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* OK button */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={goNext}
                  disabled={saving || submitting}
                  className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Submitting…
                    </>
                  ) : index < form.questions.length - 1 ? (
                    <>OK <span className="opacity-70">✓</span></>
                  ) : (
                    <>Submit <span className="opacity-70">✓</span></>
                  )}
                </button>
                <span className="text-[11px] text-white/30">
                  press{" "}
                  <kbd className="rounded border border-white/15 bg-white/8 px-1 py-0.5 font-mono text-[10px]">
                    Enter ↵
                  </kbd>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav arrows */}
      <div className="absolute bottom-6 right-6 flex overflow-hidden rounded-lg shadow-lg">
        <button
          onClick={goBack}
          disabled={index === 0}
          className="flex h-9 w-9 items-center justify-center text-white transition-opacity disabled:opacity-30"
          style={{ backgroundColor: primaryColor }}
          aria-label="Previous question"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <button
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center border-l border-white/20 text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
          aria-label="Next question"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Powered by */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <p className="text-[11px] text-[#333]">Powered by Typeform Clone</p>
      </div>
    </div>
  );
}
