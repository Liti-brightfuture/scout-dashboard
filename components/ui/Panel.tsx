import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(22,22,30,0.98),rgba(17,17,24,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
