import { cn } from "@/lib/utils";
import type { FilmFormat } from "@/lib/types";

export function ShowtimeButton({
  time,
  format,
  href,
  className,
}: {
  time: string;
  format: FilmFormat;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex min-h-11 min-w-20 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center transition hover:border-primary/50 hover:bg-primary/10",
        className,
      )}
    >
      <span className="text-sm font-semibold tracking-wide">{time}</span>
      {format !== "Standard" && (
        <span className="text-[10px] tracking-wider text-primary uppercase">{format}</span>
      )}
    </a>
  );
}
