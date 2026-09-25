export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <p className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#666]">
        Coming soon
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-[#191919]">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[#666]">{body}</p>
    </div>
  );
}
