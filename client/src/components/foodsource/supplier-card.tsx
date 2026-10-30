import { Check, MapPin, NotebookPen, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORY_LABELS, type SupplierWithScore } from "@/lib/api/types";
import type { UserNote } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";
import { ContactList } from "./contacts";
import { Value } from "./no-data";
import { ScoreBadge } from "./score-badge";
import { StatusChip } from "./status-chip";
import { SupplierBadges } from "./supplier-badges";

interface Props {
  supplier: SupplierWithScore;
  note?: UserNote | undefined;
  selected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
  onOpen: (focusNotes?: boolean) => void;
}

export function SupplierCard({
  supplier: s,
  note,
  selected,
  compareDisabled,
  onToggleCompare,
  onOpen,
}: Props) {
  const isBest = s.rank_badge === "best";
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-pop",
        isBest && "ring-2 ring-ink",
        selected && "ring-2 ring-primary",
      )}
    >
      <header className="flex items-start gap-3">
        <CategoryIcon category={s.category} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{CATEGORY_LABELS[s.category]}</p>
          <button
            type="button"
            onClick={() => onOpen()}
            className="text-left font-display text-lg font-bold leading-tight hover:underline hover:decoration-primary hover:decoration-2 hover:underline-offset-4"
          >
            {s.name}
          </button>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" /> {s.city} · {s.region}
          </p>
        </div>
        <ScoreBadge supplier={s} />
      </header>

      <SupplierBadges supplier={s} />

      <dl className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-secondary px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">Мин. заказ</dt>
          <dd className="mt-0.5 font-semibold">
            <Value>{s.min_order}</Value>
          </dd>
        </div>
        <div className="rounded-2xl bg-secondary px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">Цена</dt>
          <dd className="mt-0.5 font-semibold">
            <Value>{s.price_info}</Value>
          </dd>
        </div>
      </dl>

      {s.score_reasons.length > 0 && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Почему: </span>
          {s.score_reasons.join(" · ")}
        </p>
      )}

      <footer className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Button
          size="sm"
          variant={selected ? "ink" : "secondary"}
          onClick={onToggleCompare}
          disabled={!selected && compareDisabled}
          aria-pressed={selected}
        >
          {selected ? <Check /> : <Plus />} Сравнить
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onOpen(true)}>
          <NotebookPen /> Заметка
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="secondary">
              <Phone /> Контакты
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 rounded-2xl border-0 shadow-pop">
            <ContactList supplier={s} />
          </PopoverContent>
        </Popover>
        <StatusChip note={note} className="ml-auto" />
      </footer>
    </article>
  );
}
