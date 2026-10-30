import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SupplierWithScore } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function scoreTone(score: number) {
  if (score >= 75) return "bg-primary text-primary-foreground";
  if (score >= 50) return "bg-primary-soft text-foreground";
  return "bg-secondary text-muted-foreground";
}

export function ScoreBreakdown({ supplier }: { supplier: SupplierWithScore }) {
  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {supplier.score_breakdown.map((b) => (
          <li key={b.label} className="flex items-center justify-between gap-6 tabular">
            <span className={cn(b.points === 0 && "opacity-60")}>{b.label}</span>
            <span className={cn("font-semibold", b.points > 0 ? "text-primary" : "opacity-60")}>
              +{b.points}
              <span className="font-normal opacity-60"> / {b.max}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-ink-foreground/15 pt-2 text-ink-muted">
        Скор = набранные баллы / максимум по активным критериям × 100
      </p>
    </div>
  );
}

export function ScoreBadge({
  supplier,
  size = "md",
}: {
  supplier: SupplierWithScore;
  size?: "md" | "lg" | undefined;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Скор ${supplier.score} из 100 — подробнее`}
          className={cn(
            "group inline-flex shrink-0 cursor-help items-center gap-1 rounded-2xl font-display font-bold tabular transition-transform hover:scale-105",
            scoreTone(supplier.score),
            size === "lg" ? "h-14 px-4 text-2xl" : "h-10 px-3 text-lg",
          )}
        >
          {supplier.score}
          <Info className="size-3.5 opacity-50 group-hover:opacity-100" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" className="w-64">
        <p className="mb-2 text-sm font-semibold">Почему {supplier.score} из 100</p>
        <ScoreBreakdown supplier={supplier} />
      </TooltipContent>
    </Tooltip>
  );
}
