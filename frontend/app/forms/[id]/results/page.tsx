"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { exportCsvUrl, getForm, getResponse, getStats, listResponses } from "@/lib/api";
import type { FormDetail, FormStats, ResponseDetail, ResponseListItem } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const formId = Number(id);

  const [form, setForm] = useState<FormDetail | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ResponseDetail | null>(null);
  const [tab, setTab] = useState<"responses" | "stats">("responses");

  useEffect(() => {
    (async () => {
      try {
        const [f, r, s] = await Promise.all([getForm(formId), listResponses(formId), getStats(formId)]);
        setForm(f);
        setResponses(r);
        setStats(s);
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  async function openDetail(responseId: number) {
    const d = await getResponse(formId, responseId);
    setDetail(d);
  }

  if (loading || !form) return <div className="py-24 text-center text-[#aaa]">Loading…</div>;

  const titleById = new Map(form.questions.map((q) => [q.id, q.title]));

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <header className="flex h-14 items-center justify-between border-b border-black/8 bg-white px-5">
        <div className="flex items-center gap-3">
          <Logo href="/forms" size="sm" />
          <span className="text-[#ddd]">|</span>
          <span className="text-[15px] font-semibold">{form.title}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/forms/${formId}/edit`}>
            <Button variant="secondary">Back to editor</Button>
          </Link>
          <a href={exportCsvUrl(formId)}>
            <Button variant="secondary">Export CSV</Button>
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {stats && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Total responses" value={stats.total_responses} />
            <StatCard label="Completed" value={stats.completed_responses} />
            <StatCard label="Completion rate" value={`${stats.completion_rate}%`} />
          </div>
        )}

        <div className="mb-4 flex gap-4 border-b border-black/8">
          {(["responses", "stats"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-1 pb-2 text-sm font-medium capitalize ${
                tab === t ? "border-[#191919] text-[#191919]" : "border-transparent text-[#999] hover:text-[#555]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "responses" ? (
          responses.length === 0 ? (
            <p className="py-16 text-center text-[#aaa]">No responses yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-[#fafafa] text-left text-[11px] font-semibold uppercase tracking-wider text-[#999]">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Started</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {responses.map((r) => (
                    <tr key={r.id} className="hover:bg-[#fafafa]">
                      <td className="px-4 py-2.5 text-[#888]">#{r.id}</td>
                      <td className="px-4 py-2.5">{new Date(r.started_at).toLocaleString()}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            r.completed ? "bg-[#e6f6ec] text-[#0A6B4A]" : "bg-[#fff6d8] text-[#8a6d00]"
                          }`}
                        >
                          {r.completed ? "Completed" : "Partial"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => openDetail(r.id)} className="text-[#555] hover:text-[#191919]">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {stats?.questions.map((q) => (
              <div key={q.question_id} className="rounded-2xl border border-black/8 bg-white p-4">
                <p className="font-medium">{q.title}</p>
                <p className="mb-3 text-xs text-[#aaa]">
                  {q.total_answers} answer{q.total_answers === 1 ? "" : "s"}
                </p>
                {q.option_counts && Object.keys(q.option_counts).length > 0 && (
                  <div className="space-y-1.5">
                    {Object.entries(q.option_counts).map(([label, count]) => {
                      const pct = q.total_answers ? Math.round((count / q.total_answers) * 100) : 0;
                      return (
                        <div key={label} className="flex items-center gap-2 text-sm">
                          <span className="w-32 truncate text-[#555]">{label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
                            <div className="h-full rounded-full bg-[#191919]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-10 text-right text-xs text-[#aaa]">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {q.average !== null && q.average !== undefined && (
                  <p className="text-sm text-[#555]">
                    Average: <span className="font-medium">{q.average}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Response #${detail?.id ?? ""}`}>
        {detail && (
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {detail.answers.map((a) => (
              <div key={a.id} className="border-b border-black/5 pb-2">
                <p className="text-xs font-medium text-[#aaa]">{titleById.get(a.question_id) || "Question"}</p>
                <p className="text-sm">
                  {a.value_text ?? (a.value_json ? JSON.stringify(a.value_json) : "—")}
                </p>
              </div>
            ))}
            {detail.answers.length === 0 && <p className="text-sm text-[#aaa]">No answers recorded.</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-white p-4">
      <p className="text-xs font-medium text-[#aaa]">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
