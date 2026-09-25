"use client";

import { useState } from "react";
import type { FormDetail } from "@/lib/types";

const SWATCHES = ["#191919", "#0445AF", "#0A6B4A", "#E24B4A", "#7A5AF8", "#E57C23", "#0E8C8C", "#D23B80"];

export function DesignPanel({
  form,
  onSave,
}: {
  form: FormDetail;
  onSave: (patch: { theme?: object; thank_you_message?: string }) => void;
}) {
  const current = (form.theme?.primaryColor as string) || "#191919";
  const [color, setColor] = useState(current);
  const [thanks, setThanks] = useState(form.thank_you_message || "");

  return (
    <div className="h-full overflow-auto bg-white p-8">
      <h2 className="text-lg font-semibold text-[#191919]">Design</h2>
      <p className="mt-1 text-sm text-[#666]">Theme color and thank-you screen for this typeform.</p>

      <div className="mt-8">
        <p className="text-[13px] font-medium text-[#191919]">Primary color</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                onSave({ theme: { ...form.theme, primaryColor: c } });
              }}
              className={`h-9 w-9 rounded-full border-2 ${color === c ? "border-[#191919]" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 max-w-lg">
        <p className="text-[13px] font-medium text-[#191919]">Thank-you message</p>
        <textarea
          value={thanks}
          onChange={(e) => setThanks(e.target.value)}
          onBlur={() => onSave({ thank_you_message: thanks })}
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#191919]"
        />
      </div>

      <div className="mt-10 rounded-2xl border border-black/8 bg-[#fafafa] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">Coming soon</p>
        <p className="mt-2 text-sm text-[#666]">
          Custom fonts, background images, and branded themes will live here. Color and thank-you copy already apply
          to the public respondent flow.
        </p>
      </div>
    </div>
  );
}
