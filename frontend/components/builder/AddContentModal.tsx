"use client";

import { useState } from "react";
import { QUESTION_META } from "@/lib/questionMeta";
import type { QuestionType } from "@/lib/types";

/* ─── types ──────────────────────────────────────────────────────────── */
interface GroupItem {
  label: string;
  icon: string;
  type?: QuestionType;
  settings?: Record<string, unknown>;
  soon?: boolean;
}
interface Group {
  group: string;
  items: GroupItem[];
}

/* ─── data ───────────────────────────────────────────────────────────── */
const GROUPS: Group[] = [
  {
    group: "Contact info",
    items: [
      { label: "Contact Info",  icon: "👤", type: "short_text", settings: { variant: "contact_info" } },
      { label: "Email",         icon: "✉️",  type: "email" },
      { label: "Phone Number",  icon: "☎️",  soon: true },
      { label: "Address",       icon: "📍", soon: true },
      { label: "Website",       icon: "🔗", soon: true },
    ],
  },
  {
    group: "Choice",
    items: [
      { label: "Multiple Choice", icon: "☰",  type: "multiple_choice" },
      { label: "Dropdown",        icon: "⌄",  type: "dropdown" },
      { label: "Picture Choice",  icon: "🖼️",  soon: true },
      { label: "Yes/No",          icon: "◑",  type: "yes_no" },
      { label: "Legal",           icon: "⚖️",  soon: true },
      { label: "Checkbox",        icon: "☑",  soon: true },
    ],
  },
  {
    group: "Rating & ranking",
    items: [
      { label: "Net Promoter Score®", icon: "📈", soon: true },
      { label: "Opinion Scale",       icon: "📊", soon: true },
      { label: "Rating",              icon: "★",  type: "rating" },
      { label: "Ranking",             icon: "☰",  soon: true },
      { label: "Matrix",              icon: "▦",  soon: true },
    ],
  },
];

const TEXT_AND_VIDEO: GroupItem[] = [
  { label: "Long Text",      icon: "¶",   type: "long_text" },
  { label: "Short Text",     icon: "=",   type: "short_text" },
  { label: "Video and Audio",icon: "▶",   soon: true },
  { label: "Clarify with AI",icon: "✦",   soon: true },
  { label: "FAQ with AI",    icon: "↺",   soon: true },
];

const OTHER: GroupItem[] = [
  { label: "Number",          icon: "#",  type: "number" },
  { label: "Date",            icon: "📅", soon: true },
  { label: "Signature",       icon: "✍️",  soon: true },
  { label: "Payment",         icon: "💳", soon: true },
  { label: "File Upload",     icon: "📎", soon: true },
  { label: "Scheduler",       icon: "📅", soon: true },
];

const OTHER_RIGHT: GroupItem[] = [
  { label: "Welcome Screen",   icon: "▣",   soon: true },
  { label: "Partial Submit",   icon: "▷",   soon: true },
  { label: "Statement",        icon: "❝",   soon: true },
  { label: "Question Group",   icon: "⊟",   soon: true },
  { label: "End Screen",       icon: "▣",   soon: true },
  { label: "Redirect to URL",  icon: "↪",   soon: true },
];

const TYPE_BY_LABEL: Record<string, QuestionType> = {
  "Email":           "email",
  "Multiple Choice": "multiple_choice",
  "Dropdown":        "dropdown",
  "Yes/No":          "yes_no",
  "Rating":          "rating",
  "Long Text":       "long_text",
  "Short Text":      "short_text",
  "Number":          "number",
};

/* ─── sub-components ─────────────────────────────────────────────────── */
function SoonBadge() {
  return (
    <span className="ml-auto flex items-center gap-0.5 rounded-full border border-[#c9b6f0] bg-[#f4f0ff] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#7c59e0]">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-[#c9b6f0]">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
      Pro
    </span>
  );
}

function ItemBtn({
  item,
  onClick,
}: {
  item: GroupItem;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={item.soon ? undefined : onClick}
      disabled={item.soon}
      className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors ${
        item.soon
          ? "cursor-default text-[#bbb]"
          : "text-[#191919] hover:bg-[#f5f3ef]"
      }`}
    >
      <span className="w-5 shrink-0 text-center text-[15px]">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.soon && <SoonBadge />}
    </button>
  );
}

/* ─── main component ─────────────────────────────────────────────────── */
export function AddContentModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: QuestionType, settings?: Record<string, unknown>) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"elements" | "import" | "ai">("elements");

  if (!open) return null;

  function handleItem(item: GroupItem) {
    if (item.soon) return;
    const type = item.type ?? TYPE_BY_LABEL[item.label];
    if (type) onPick(type, item.settings);
  }

  const allItems: GroupItem[] = [
    ...GROUPS.flatMap((g) => g.items),
    ...TEXT_AND_VIDEO,
    ...OTHER,
    ...OTHER_RIGHT,
  ];

  const filtered = search.trim()
    ? allItems.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header tabs */}
        <div className="flex items-center justify-between border-b border-black/8 px-6">
          <div className="flex gap-0">
            {(
              [
                { key: "elements", label: "Add form elements" },
                { key: "import",   label: "Import questions" },
                { key: "ai",       label: "Create with AI" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`border-b-2 px-1 pb-3 pt-4 text-[13px] font-medium transition-colors mr-6 ${
                  activeTab === t.key
                    ? "border-[#191919] text-[#191919]"
                    : "border-transparent text-[#999] hover:text-[#555]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#999] transition-colors hover:bg-black/5 hover:text-[#191919]"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {activeTab !== "elements" ? (
          <div className="flex flex-1 items-center justify-center py-20 text-[#aaa]">
            <div className="text-center">
              <p className="text-lg font-medium text-[#191919]">Coming soon</p>
              <p className="mt-1 text-sm">This feature is a placeholder for the assignment.</p>
            </div>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-[240px_1fr] overflow-hidden">
            {/* Left sidebar */}
            <div className="flex flex-col gap-4 overflow-y-auto border-r border-black/8 p-5">
              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search form elements"
                  className="w-full rounded-xl border border-black/10 py-2 pl-8 pr-3 text-[13px] outline-none transition-colors focus:border-[#191919]"
                />
              </div>

              {filtered ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#888]">Results</p>
                  <div className="space-y-0.5">
                    {filtered.length === 0 ? (
                      <p className="px-2 py-3 text-[13px] text-[#aaa]">No elements found.</p>
                    ) : (
                      filtered.map((item) => (
                        <ItemBtn key={item.label} item={item} onClick={() => handleItem(item)} />
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#888]">Recommended</p>
                    <div className="space-y-0.5">
                      {QUESTION_META.slice(0, 3).map((m) => (
                        <button
                          key={m.type}
                          onClick={() => onPick(m.type)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-[#191919] transition-colors hover:bg-[#f5f3ef]"
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                            style={{ backgroundColor: m.color }}
                          >
                            {m.letter}
                          </span>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#888]">Connect to apps</p>
                    {[
                      { name: "HubSpot", color: "#FF7A59", letter: "H" },
                      { name: "Salesforce", color: "#00A1E0", letter: "S" },
                    ].map((app) => (
                      <button
                        key={app.name}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-[#aaa] transition-colors cursor-default"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white opacity-50"
                          style={{ backgroundColor: app.color }}
                        >
                          {app.letter}
                        </span>
                        {app.name}
                        <SoonBadge />
                      </button>
                    ))}
                    <button className="mt-1 flex w-full items-center gap-2 px-2.5 py-2 text-[13px] text-[#555] hover:text-[#191919]">
                      <span className="text-[16px]">⊞</span> Browse all apps
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right content grid */}
            <div className="overflow-y-auto p-6">
              {filtered ? null : (
                <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                  {/* Col 1: Contact info + Text & Video */}
                  <div className="space-y-6">
                    {GROUPS.slice(0, 1).map((col) => (
                      <div key={col.group}>
                        <p className="mb-2 text-[12px] font-semibold text-[#191919]">{col.group}</p>
                        <div className="space-y-0.5">
                          {col.items.map((item) => (
                            <ItemBtn key={item.label} item={item} onClick={() => handleItem(item)} />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="mb-2 text-[12px] font-semibold text-[#191919]">Text &amp; Video</p>
                      <div className="space-y-0.5">
                        {TEXT_AND_VIDEO.map((item) => (
                          <ItemBtn key={item.label} item={item} onClick={() => handleItem(item)} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Choice + Other (left) */}
                  <div className="space-y-6">
                    {GROUPS.slice(1, 2).map((col) => (
                      <div key={col.group}>
                        <p className="mb-2 text-[12px] font-semibold text-[#191919]">{col.group}</p>
                        <div className="space-y-0.5">
                          {col.items.map((item) => (
                            <ItemBtn key={item.label} item={item} onClick={() => handleItem(item)} />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="mb-2 text-[12px] font-semibold text-[#191919]">Other</p>
                      <div className="space-y-0.5">
                        {OTHER.map((item) => (
                          <ItemBtn key={item.label} item={item} onClick={() => handleItem(item)} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Rating & ranking + Other (right) */}
                  <div className="space-y-6">
                    {GROUPS.slice(2, 3).map((col) => (
                      <div key={col.group}>
                        <p className="mb-2 text-[12px] font-semibold text-[#191919]">{col.group}</p>
                        <div className="space-y-0.5">
                          {col.items.map((item) => (
                            <ItemBtn key={item.label} item={item} onClick={() => handleItem(item)} />
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <p className="mb-2 text-[12px] font-semibold text-[#191919]">&nbsp;</p>
                      <div className="space-y-0.5">
                        {OTHER_RIGHT.map((item) => (
                          <ItemBtn key={item.label} item={item} onClick={() => handleItem(item)} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
