import { Package, UtensilsCrossed, Wheat } from "lucide-react";
import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ICONS = { ingredients: Wheat, finished: UtensilsCrossed, packaging: Package } as const;

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = ICONS[category];
  return (
    <span
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-foreground",
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={2.2} />
    </span>
  );
}
