"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ThankYouPage({ params }: { params: Promise<{ slug: string }> }) {
  use(params);
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[#aaa]">Loading…</div>}>
      <ThankYouContent />
    </Suspense>
  );
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("msg") || "Thanks for completing this typeform!";

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="max-w-lg text-[36px] font-semibold leading-tight tracking-tight sm:text-[44px]">{message}</h1>
        <p className="mt-4 text-sm text-[#888]">That&apos;s all — you can close this window now.</p>
      </motion.div>
    </div>
  );
}
