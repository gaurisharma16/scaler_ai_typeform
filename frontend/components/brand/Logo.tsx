import Link from "next/link";

export function Logo({
  href = "/",
  inverted = false,
  size = "md",
}: {
  href?: string | null;
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const className = `font-semibold tracking-tight ${inverted ? "text-white" : "text-[#191919]"} ${
    size === "lg" ? "text-[28px]" : size === "sm" ? "text-[18px]" : "text-[22px]"
  }`;
  const mark = (
    <span className={className} style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
      typeform
    </span>
  );
  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex items-center">
      {mark}
    </Link>
  );
}
