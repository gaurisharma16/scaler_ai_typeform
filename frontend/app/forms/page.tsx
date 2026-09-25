"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createForm,
  deleteForm,
  duplicateForm,
  listForms,
  publishForm,
  unpublishForm,
  updateForm,
} from "@/lib/api";
import type { FormListItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

function timeAgo(date: string): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

/* ────────────────────── form color dot ──────────────────────────────── */
const COLORS = [
  "#FF6B5E", "#7C3AED", "#0891B2", "#059669", "#D97706", "#DB2777",
  "#2563EB", "#9333EA", "#16A34A", "#EA580C",
];
function formColor(id: number) {
  return COLORS[id % COLORS.length];
}

/* ────────────────────── main component ──────────────────────────────── */
export default function FormsDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [renameTarget, setRenameTarget] = useState<FormListItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    try {
      setForms(await listForms());
    } catch {
      showToast("Failed to load forms", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (createOpen) setTimeout(() => createInputRef.current?.focus(), 60);
  }, [createOpen]);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      const form = await createForm(newTitle.trim());
      setCreateOpen(false);
      setNewTitle("");
      router.push(`/forms/${form.id}/edit`);
    } catch {
      showToast("Could not create form", "error");
    }
  }

  async function handleRename() {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await updateForm(renameTarget.id, { title: renameValue.trim() });
      showToast("Form renamed");
      setRenameTarget(null);
      refresh();
    } catch {
      showToast("Could not rename form", "error");
    }
  }

  async function handleDuplicate(form: FormListItem) {
    try {
      await duplicateForm(form.id);
      showToast("Form duplicated");
      setMenuId(null);
      refresh();
    } catch {
      showToast("Could not duplicate form", "error");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteForm(deleteTarget.id);
      showToast("Form deleted");
      setDeleteTarget(null);
      refresh();
    } catch {
      showToast("Could not delete form", "error");
    }
  }

  async function handleTogglePublish(form: FormListItem) {
    try {
      if (form.status === "published") {
        await unpublishForm(form.id);
        showToast("Form unpublished");
      } else {
        await publishForm(form.id);
        showToast("Form published 🎉");
      }
      setMenuId(null);
      refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update form", "error");
    }
  }

  return (
    <WorkspaceShell>
      {/* Close any open menu when clicking outside */}
      <div className="px-10 py-8" onClick={() => setMenuId(null)}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-[#888]">My workspace</p>
            <h1 className="mt-1 text-[26px] font-semibold tracking-tight">Your typeforms</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-full bg-black/5 p-0.5">
              {(["list", "grid"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium capitalize transition-all ${
                    view === v ? "bg-white text-[#191919] shadow-sm" : "text-[#666] hover:text-[#333]"
                  }`}
                >
                  {v === "list" ? (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                      </svg>
                      List
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                      </svg>
                      Grid
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              + Create typeform
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#aaa]">
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5f3ef]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <p className="mt-4 text-[16px] font-semibold">No typeforms yet</p>
            <p className="mt-1 text-[13px] text-[#777]">Create your first form to start collecting responses.</p>
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              Create your first typeform
            </Button>
          </div>
        ) : view === "list" ? (
          <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-black/8">
                <tr>
                  {["Typeform", "Status", "Responses", "Updated", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#999]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="group border-b border-black/5 last:border-0 hover:bg-[#fafaf8]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-white"
                          style={{ backgroundColor: formColor(form.id) }}
                        >
                          {form.title[0]?.toUpperCase() ?? "F"}
                        </div>
                        <Link
                          href={`/forms/${form.id}/edit`}
                          className="font-semibold transition-colors hover:text-[#FF6B5E]"
                        >
                          {form.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          form.status === "published"
                            ? "bg-[#dcfce7] text-[#166534]"
                            : "bg-black/5 text-[#666]"
                        }`}
                      >
                        {form.status === "published" && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                        )}
                        {form.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#555]">
                      {form.response_count > 0 ? (
                        <Link href={`/forms/${form.id}/results`} className="hover:underline">
                          {form.response_count.toLocaleString()}
                        </Link>
                      ) : (
                        <span className="text-[#ccc]">0</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#888]">{timeAgo(form.updated_at)}</td>
                    <td className="relative px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === form.id ? null : form.id);
                        }}
                        className="rounded-full px-2 py-1 text-[#bbb] opacity-0 transition-all group-hover:opacity-100 hover:bg-black/5 hover:text-[#555]"
                      >
                        ···
                      </button>
                      {menuId === form.id && (
                        <FormMenu
                          form={form}
                          onEdit={() => router.push(`/forms/${form.id}/edit`)}
                          onResults={() => router.push(`/forms/${form.id}/results`)}
                          onPublish={() => handleTogglePublish(form)}
                          onRename={() => {
                            setRenameTarget(form);
                            setRenameValue(form.title);
                            setMenuId(null);
                          }}
                          onDuplicate={() => handleDuplicate(form)}
                          onDelete={() => {
                            setDeleteTarget(form);
                            setMenuId(null);
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="group relative overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Preview area */}
                <Link href={`/forms/${form.id}/edit`}>
                  <div
                    className="flex h-28 items-end p-4"
                    style={{
                      background: `linear-gradient(135deg, ${formColor(form.id)}22 0%, ${formColor(form.id)}44 100%)`,
                    }}
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-[18px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: formColor(form.id) }}
                    >
                      {form.title[0]?.toUpperCase() ?? "F"}
                    </span>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/forms/${form.id}/edit`} className="font-semibold hover:text-[#FF6B5E]">
                      {form.title}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId(menuId === form.id ? null : form.id);
                      }}
                      className="rounded-full p-1 text-[#bbb] hover:text-[#555]"
                    >
                      ···
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        form.status === "published"
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-black/5 text-[#666]"
                      }`}
                    >
                      {form.status}
                    </span>
                    <span className="text-[12px] text-[#aaa]">· {form.response_count} responses</span>
                  </div>
                  {menuId === form.id && (
                    <FormMenu
                      form={form}
                      onEdit={() => router.push(`/forms/${form.id}/edit`)}
                      onResults={() => router.push(`/forms/${form.id}/results`)}
                      onPublish={() => handleTogglePublish(form)}
                      onRename={() => {
                        setRenameTarget(form);
                        setRenameValue(form.title);
                        setMenuId(null);
                      }}
                      onDuplicate={() => handleDuplicate(form)}
                      onDelete={() => {
                        setDeleteTarget(form);
                        setMenuId(null);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Create new card */}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/10 bg-white/50 text-[#aaa] transition-all hover:border-black/20 hover:bg-white hover:text-[#555]"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="text-[13px] font-medium">New typeform</span>
            </button>
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a new typeform">
        <input
          ref={createInputRef}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Give it a name…"
          className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#191919]"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!newTitle.trim()}>Create</Button>
        </div>
      </Modal>

      {/* Rename modal */}
      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename typeform">
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#191919]"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRenameTarget(null)}>Cancel</Button>
          <Button onClick={handleRename}>Save</Button>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete this typeform?">
        <p className="text-[13px] text-[#555]">
          This will permanently delete <strong>{deleteTarget?.title}</strong> and all its responses. This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete forever</Button>
        </div>
      </Modal>
    </WorkspaceShell>
  );
}

function FormMenu({
  form,
  onEdit,
  onResults,
  onPublish,
  onRename,
  onDuplicate,
  onDelete,
}: {
  form: FormListItem;
  onEdit: () => void;
  onResults: () => void;
  onPublish: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="absolute right-4 top-10 z-20 w-48 overflow-hidden rounded-2xl border border-black/8 bg-white py-1 text-left text-[13px] shadow-2xl ring-1 ring-black/5"
      onClick={(e) => e.stopPropagation()}
    >
      <MenuItem onClick={onEdit} icon="✏️">Edit</MenuItem>
      <MenuItem onClick={onResults} icon="📊">Results</MenuItem>
      <MenuItem onClick={onPublish} icon={form.status === "published" ? "🔒" : "🚀"}>
        {form.status === "published" ? "Unpublish" : "Publish"}
      </MenuItem>
      <hr className="my-1 border-black/8" />
      <MenuItem onClick={onRename} icon="✏">Rename</MenuItem>
      <MenuItem onClick={onDuplicate} icon="⧉">Duplicate</MenuItem>
      {form.status === "published" && form.share_slug && (
        <a
          href={`/f/${form.share_slug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-black/5"
        >
          <span className="w-4 text-center">↗</span>
          Open live link
        </a>
      )}
      <hr className="my-1 border-black/8" />
      <MenuItem onClick={onDelete} danger icon="🗑">Delete</MenuItem>
    </div>
  );
}

function MenuItem({
  onClick,
  children,
  danger,
  icon,
}: {
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  icon?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-black/5 ${
        danger ? "text-[#E24B4A]" : "text-[#191919]"
      }`}
    >
      {icon && <span className="w-4 text-center text-[13px]">{icon}</span>}
      {children}
    </button>
  );
}
