"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function ShareModal({
  open,
  onClose,
  slug,
  published,
}: {
  open: boolean;
  onClose: () => void;
  slug: string | null;
  published: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" && slug ? `${window.location.origin}/f/${slug}` : "";

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title="Share this typeform">
      {published && url ? (
        <>
          <p className="text-sm text-[#666]">Anyone with the link can fill this form — no login required.</p>
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={url}
              className="flex-1 rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2 text-sm"
            />
            <Button onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-[#666]">Publish this typeform first to get a shareable public link.</p>
      )}
    </Modal>
  );
}
