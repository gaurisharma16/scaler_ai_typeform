"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onHome = pathname === "/forms";

  return (
    <div className="flex min-h-screen bg-[#f6f6f6]">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-black/8 bg-white">
        <div className="flex h-16 items-center px-5">
          <Logo href="/forms" size="sm" />
        </div>
        <nav className="flex flex-1 flex-col px-3">
          <Link
            href="/forms"
            className={`rounded-lg px-3 py-2 text-[13px] font-medium ${
              onHome ? "bg-[#191919] text-white" : "text-[#444] hover:bg-black/5"
            }`}
          >
            Home
          </Link>
          <Link
            href="/forms"
            className="mt-0.5 rounded-lg px-3 py-2 text-[13px] font-medium text-[#444] hover:bg-black/5"
          >
            Create
          </Link>
          <Link
            href="/forms"
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-[#444] hover:bg-black/5"
          >
            Insights
          </Link>
          <div className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#999]">
            Workspaces
          </div>
          <div className="mt-1 flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0445AF] text-[10px] font-bold text-white">
              M
            </span>
            <span className="text-[13px] font-medium text-[#191919]">My workspace</span>
          </div>
        </nav>
        <div className="border-t border-black/8 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#191919] text-xs font-semibold text-white">
              YO
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#191919]">You</p>
              <p className="text-[11px] text-[#888]">Free plan</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
