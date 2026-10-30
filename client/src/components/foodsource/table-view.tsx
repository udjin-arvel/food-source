import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CATEGORY_LABELS,
  type SortKey,
  type SortOrder,
  type SupplierWithScore,
} from "@/lib/api/types";
import type { UserNote } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";
import { Value } from "./no-data";
import { ScoreBadge } from "./score-badge";
import { StatusChip } from "./status-chip";
import { SupplierBadges } from "./supplier-badges";

interface Props {
  items: SupplierWithScore[];
  notes: Record<number, UserNote>;
  selected: number[];
  sort: SortKey;
  order: SortOrder;
  onSort: (key: SortKey) => void;
  onToggleCompare: (id: number) => void;
  onOpen: (id: number) => void;
}

function SortHead({
  label,
  k,
  sort,
  order,
  onSort,
  className,
}: {
  label: string;
  k: SortKey;
  sort: SortKey;
  order: SortOrder;
  onSort: (k: SortKey) => void;
  className?: string | undefined;
}) {
  const active = sort === k;
  const Icon = !active ? ArrowUpDown : order === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("whitespace-nowrap px-3 py-3 font-medium", className)}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 -mx-1.5 hover:bg-secondary",
          active && "text-foreground",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", !active && "opacity-40")} />
      </button>
    </th>
  );
}

export function TableView({
  items,
  notes,
  selected,
  sort,
  order,
  onSort,
  onToggleCompare,
  onOpen,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-card shadow-card scrollbar-thin">
      <table className="w-full min-w-[880px] text-sm">
        <thead className="border-b text-left text-xs text-muted-foreground">
          <tr>
            <th className="w-12 px-4 py-3">
              <span className="sr-only">Сравнить</span>
            </th>
            <SortHead label="Поставщик" k="name" sort={sort} order={order} onSort={onSort} />
            <th className="px-3 py-3 font-medium">Категория</th>
            <th className="px-3 py-3 font-medium">Регион</th>
            <SortHead label="MOQ" k="min_order" sort={sort} order={order} onSort={onSort} />
            <SortHead label="Цена/ед." k="price" sort={sort} order={order} onSort={onSort} />
            <th className="px-3 py-3 font-medium">Сертификаты</th>
            <th className="px-3 py-3 font-medium">Доставка</th>
            <SortHead
              label="Скор"
              k="score"
              sort={sort}
              order={order}
              onSort={onSort}
              className="pr-5 text-right"
            />
          </tr>
        </thead>
        <tbody>
          {items.map((s) => {
            const isSel = selected.includes(s.id);
            return (
              <tr
                key={s.id}
                className={cn(
                  "border-b last:border-0 transition-colors hover:bg-background",
                  isSel && "bg-primary-soft hover:bg-primary-soft",
                )}
              >
                <td className="px-4 py-3 align-top">
                  <Checkbox
                    checked={isSel}
                    disabled={!isSel && selected.length >= 3}
                    onCheckedChange={() => onToggleCompare(s.id)}
                    aria-label={`Сравнить ${s.name}`}
                  />
                </td>
                <td className="max-w-64 px-3 py-3 align-top">
                  <button
                    type="button"
                    onClick={() => onOpen(s.id)}
                    className="text-left font-semibold hover:underline hover:decoration-primary hover:decoration-2 hover:underline-offset-4"
                  >
                    {s.name}
                  </button>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <SupplierBadges supplier={s} compact />
                    <StatusChip note={notes[s.id]} />
                  </div>
                </td>
                <td className="px-3 py-3 align-top">{CATEGORY_LABELS[s.category]}</td>
                <td className="px-3 py-3 align-top">
                  {s.region}
                  <span className="block text-xs text-muted-foreground">{s.city}</span>
                </td>
                <td className="px-3 py-3 align-top tabular">
                  <Value>{s.min_order}</Value>
                </td>
                <td className="px-3 py-3 align-top tabular">
                  <Value>
                    {s.price_per_unit != null
                      ? `${s.price_per_unit.toLocaleString("ru-RU")} ₽`
                      : null}
                  </Value>
                </td>
                <td className="max-w-44 px-3 py-3 align-top">
                  <Value>{s.certificates}</Value>
                </td>
                <td className="max-w-48 px-3 py-3 align-top">
                  <Value>{s.delivery_terms}</Value>
                </td>
                <td className="px-3 py-3 pr-5 text-right align-top">
                  <ScoreBadge supplier={s} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
