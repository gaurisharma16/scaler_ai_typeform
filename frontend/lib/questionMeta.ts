import type { QuestionType } from "./types";

export interface QuestionMeta {
  type: QuestionType;
  label: string;
  hint: string;
  group: string;
  color: string;
  letter: string;
}

export const QUESTION_META: QuestionMeta[] = [
  { type: "short_text", label: "Short text", hint: "A short free-text answer", group: "Text", color: "#0445AF", letter: "Aa" },
  { type: "long_text", label: "Long text", hint: "A longer written answer", group: "Text", color: "#0A6B4A", letter: "¶" },
  { type: "email", label: "Email", hint: "Collect an email address", group: "Contact", color: "#E24B4A", letter: "@" },
  { type: "number", label: "Number", hint: "Numeric input only", group: "Contact", color: "#7A5AF8", letter: "#" },
  { type: "multiple_choice", label: "Multiple choice", hint: "Pick one from a list", group: "Choice", color: "#E57C23", letter: "☰" },
  { type: "dropdown", label: "Dropdown", hint: "A compact select menu", group: "Choice", color: "#0E8C8C", letter: "▾" },
  { type: "yes_no", label: "Yes / No", hint: "A binary question", group: "Choice", color: "#D23B80", letter: "Y" },
  { type: "rating", label: "Rating", hint: "A 1–n scale", group: "Choice", color: "#C9A227", letter: "★" },
];

export const QUESTION_META_BY_TYPE = Object.fromEntries(QUESTION_META.map((m) => [m.type, m])) as Record<
  QuestionType,
  QuestionMeta
>;
