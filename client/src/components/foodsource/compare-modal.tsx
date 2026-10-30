import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Crown, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotes } from "@/hooks/use-notes";
import { compareQuery } from "@/lib/api/queries";
import {
  CATEGORY_LABELS,
  type CompareResponse,
  type QueryBrief,
  type SupplierWithScore,
} from "@/lib/api/types";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import { ContactList } from "./contacts";
import { Value } from "./no-data";
import { scoreTone } from "./score-badge";
import { SupplierBadges } from "./supplier-badges";

interface Props {
  open: boolean;
  ids: number[];
  brief: QueryBrief | null;
  onClose: () => void;
  onRemove: (id: number) => void;
}

type Row = {
  label: string;
  bestKey?: keyof CompareResponse["best"] | undefined;
  render: (s: SupplierWithScore) => ReactNode;
};

const ROWS: Row[] = [
  {
    label: "Скор и причины",
    bestKey: "score",
    render: (s) => (
      <div className="space-y-2">
        <span
          className={cn(
            "inline-flex h-10 items-center rounded-2xl px-3 font-display text-xl font-bold tabular",
            scoreTone(s.score),
          )}
        >
          {s.score}
        </span>
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {s.score_reasons.map((r) => (
            <li key={r}>· {r}</li>
          ))}
        </ul>
      </div>
    ),
  },
  { label: "Мин. заказ (MOQ)", bestKey: "min_order", render: (s) => <Value>{s.min_order}</Value> },
  {
    label: "Цена за единицу",
    bestKey: "price_per_unit",
    render: (s) => (
      <Value>
        {s.price_per_unit != null
          ? `${s.price_per_unit.toLocaleString("ru-RU")} ₽ / ${s.min_order_unit ?? "ед."}`
          : null}
      </Value>
    ),
  },
  { label: "Сертификаты", bestKey: "certificates", render: (s) => <Value>{s.certificates}</Value> },
  { label: "Доставка", render: (s) => <Value>{s.delivery_terms}</Value> },
  { label: "Регион", render: (s) => `${s.city} · ${s.region}` },
  { label: "Контакты", render: (s) => <ContactList supplier={s} /> },
  {
    label: "Источник и дата",
    render: (s) => (
      <span>
        {s.source}
        <span className="block text-xs text-muted-foreground">
          на {new Date(s.source_date).toLocaleDateString("ru-RU")}
        </span>
      </span>
    ),
  },
];

export function CompareModal({ open, ids, brief, onClose, onRemove }: Props) {
  const { data, isLoading } = useQuery({
    ...compareQuery(ids, brief),
    enabled: open && ids.length >= 2,
  });
  const { notes } = useNotes();
  const cols = data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden p-0">
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-4 border-b p-6 pr-16 sm:p-7 sm:pr-16">
          <div>
            <DialogTitle className="font-display text-2xl font-extrabold sm:text-3xl">
              Сравнение поставщиков
            </DialogTitle>
            <DialogDescription className="mt-1">
              Жёлтым подсвечено лучшее значение в строке.
            </DialogDescription>
          </div>
          <Button variant="ink" onClick={() => downloadCsv(cols, notes)} disabled={!cols.length}>
            <Download /> Экспорт CSV
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
          {isLoading || !data ? (
            <div className="grid gap-3 p-7 sm:grid-cols-3">
              {ids.map((id) => (
                <Skeleton key={id} className="h-80" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto p-4 sm:p-6 scrollbar-thin">
              <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-x-2 border-spacing-y-0 text-sm">
              <thead>
                <tr>
                  <th className="w-36" />
                  {cols.map((s) => (
                    <th
                      key={s.id}
                      className="rounded-t-3xl bg-secondary p-4 text-left align-top font-normal"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[s.category]}
                          </p>
                          <p className="font-display text-base font-bold leading-tight">{s.name}</p>
                        </div>
                        {cols.length > 2 && (
                          <Button
                            size="iconSm"
                            variant="ghost"
                            onClick={() => onRemove(s.id)}
                            aria-label={`Убрать ${s.name}`}
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                      <div className="mt-2">
                        <SupplierBadges supplier={s} compact />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, ri) => (
                  <tr key={row.label}>
                    <th className="py-3 pr-2 text-left align-top text-xs font-medium text-muted-foreground">
                      {row.label}
                    </th>
                    {cols.map((s) => {
                      const best = row.bestKey ? data.best[row.bestKey].includes(s.id) : false;
                      const isLast = ri === ROWS.length - 1;
                      return (
                        <td
                          key={s.id}
                          className={cn(
                            "bg-secondary px-4 py-3 align-top",
                            isLast && "rounded-b-3xl pb-5",
                          )}
                        >
                          <div
                            className={cn(
                              "relative rounded-xl",
                              best && "-mx-2 -my-1 bg-primary px-2 py-1 font-semibold",
                            )}
                          >
                            {best && <Crown className="absolute right-2 top-1.5 size-3.5" />}
                            {row.render(s)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
