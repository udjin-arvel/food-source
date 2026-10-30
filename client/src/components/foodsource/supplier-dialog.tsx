import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Database, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supplierQuery } from "@/lib/api/queries";
import { CATEGORY_LABELS, type QueryBrief } from "@/lib/api/types";
import { CategoryIcon } from "./category-icon";
import { ContactList } from "./contacts";
import { Value } from "./no-data";
import { NotesPanel } from "./notes-panel";
import { ScoreBadge, ScoreBreakdown } from "./score-badge";
import { SupplierBadges } from "./supplier-badges";

interface Props {
  id: number | null;
  brief: QueryBrief | null;
  focusNotes: boolean;
  onClose: () => void;
}

export function SupplierDialog({ id, brief, focusNotes, onClose }: Props) {
  const { data: s } = useQuery({ ...supplierQuery(id ?? 0, brief), enabled: id != null });

  return (
    <Dialog open={id != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden p-0">
        <div className="max-h-[92vh] min-w-0 overflow-x-hidden overflow-y-auto scrollbar-thin">
          {!s || s.id !== id ? (
            <div className="space-y-3 p-7">
              <DialogTitle className="sr-only">Загрузка</DialogTitle>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <div className="border-b p-6 pr-16 sm:p-7 sm:pr-16">
                <div className="flex items-start gap-4">
                  <CategoryIcon category={s.category} className="size-14 rounded-3xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[s.category]}</p>
                    <DialogTitle className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                      {s.name}
                    </DialogTitle>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" /> {s.city} · {s.region}
                    </p>
                  </div>
                  <ScoreBadge supplier={s} size="lg" />
                </div>
                <DialogDescription className="mt-4 text-base text-foreground">
                  <Value>{s.description}</Value>
                </DialogDescription>
                <div className="mt-4">
                  <SupplierBadges supplier={s} />
                </div>
              </div>

              <div className="grid gap-6 p-6 sm:p-7 md:grid-cols-[1.25fr_1fr]">
                <div className="space-y-6">
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      ["Мин. заказ", s.min_order],
                      ["Цена", s.price_info],
                      [
                        "Цена за единицу",
                        s.price_per_unit != null
                          ? `${s.price_per_unit.toLocaleString("ru-RU")} ₽`
                          : null,
                      ],
                      ["Доставка", s.delivery_terms],
                      ["Сертификаты", s.certificates],
                      ["Комментарий", s.notes],
                    ].map(([label, v]) => (
                      <div key={label} className="rounded-2xl bg-secondary px-3.5 py-3">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-0.5 font-semibold">
                          <Value>{v}</Value>
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Database className="size-4" /> Источник: {s.source}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-4" /> Актуально на{" "}
                      {new Date(s.source_date).toLocaleDateString("ru-RU")}
                    </span>
                  </div>

                  <NotesPanel supplierId={s.id} autoFocus={focusNotes} />
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="mb-3 font-display text-lg font-bold">Контакты</h3>
                    <ContactList supplier={s} />
                  </section>
                  <section className="rounded-3xl bg-ink p-5 text-sm text-ink-foreground">
                    <h3 className="mb-3 font-display text-lg font-bold">Как посчитан скор</h3>
                    <ScoreBreakdown supplier={s} />
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
