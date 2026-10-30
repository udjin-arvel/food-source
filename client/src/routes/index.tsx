import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CompareBar } from "@/components/foodsource/compare-bar";
import { CompareModal } from "@/components/foodsource/compare-modal";
import { EmptyState } from "@/components/foodsource/empty-state";
import { Filters } from "@/components/foodsource/filters";
import { Header } from "@/components/foodsource/header";
import { QueryBrief } from "@/components/foodsource/query-brief";
import { RecommendBanner } from "@/components/foodsource/recommend-banner";
import { SupplierCard } from "@/components/foodsource/supplier-card";
import { SupplierDialog } from "@/components/foodsource/supplier-dialog";
import { TableView } from "@/components/foodsource/table-view";
import { useNotes } from "@/hooks/use-notes";
import { metaQuery, suppliersQuery } from "@/lib/api/queries";
import type {
  QueryBrief as Brief,
  SortKey,
  SortOrder,
  SupplierFilters,
  SupplierWithScore,
} from "@/lib/api/types";
import { downloadCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FoodSource — подбор поставщиков продуктов для закупщика" },
      {
        name: "description",
        content:
          "Найдите поставщиков продуктов по категории и региону, сравните условия и узнайте, с кем связаться в первую очередь.",
      },
      { property: "og:title", content: "FoodSource — подбор поставщиков продуктов" },
      {
        property: "og:description",
        content: "Карточки, сравнение и прозрачный скоринг поставщиков для B2B-закупок.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PAGE_SIZE = 9;
const SORT_LABELS: Record<SortKey, string> = {
  score: "По скору",
  min_order: "По MOQ",
  price: "По цене",
  name: "По названию",
};

function Index() {
  const [filters, setFilters] = useState<SupplierFilters>({ min_order_unit: "кг" });
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [sort, setSort] = useState<SortKey>("score");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [selected, setSelected] = useState<SupplierWithScore[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [focusNotes, setFocusNotes] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const { notes } = useNotes();

  useEffect(() => {
    const t = setTimeout(() => setQ(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(1), [filters, q, brief, sort, order]);

  const { data: meta } = useQuery(metaQuery());
  const params = useMemo(
    () => ({ ...filters, q: q || undefined, sort, order, page, page_size: PAGE_SIZE, brief }),
    [filters, q, sort, order, page, brief],
  );
  const { data, isLoading, isFetching } = useQuery(suppliersQuery(params));
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const selectedIds = selected.map((s) => s.id);

  function patchFilters(p: Partial<SupplierFilters>) {
    setFilters((f) => ({ ...f, ...p }));
  }
  function resetFilters() {
    setFilters({ min_order_unit: "кг" });
    setSearch("");
  }
  function toggleCompare(s: SupplierWithScore) {
    setSelected((prev) =>
      prev.some((x) => x.id === s.id)
        ? prev.filter((x) => x.id !== s.id)
        : prev.length >= 3
          ? prev
          : [...prev, s],
    );
  }
  function open(id: number, notesFocus = false) {
    setFocusNotes(notesFocus);
    setOpenId(id);
  }
  function onTableSort(k: SortKey) {
    if (k === sort) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSort(k);
      setOrder(k === "score" ? "desc" : "asc");
    }
  }

  const filtersPanel = (
    <Filters
      meta={meta}
      filters={filters}
      search={search}
      onSearchChange={setSearch}
      onChange={patchFilters}
      onReset={resetFilters}
    />
  );

  return (
    <div className="min-h-screen pb-32">
      <Header shortlistCount={selected.length} onExport={() => downloadCsv(selected, notes)} />

      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-22 rounded-3xl bg-card p-5 shadow-card">{filtersPanel}</div>
        </aside>

        <div className="min-w-0 space-y-5">
          <QueryBrief
            meta={meta}
            active={brief}
            onSubmit={setBrief}
            onClear={() => setBrief(null)}
          />
          {brief && <RecommendBanner brief={brief} onOpen={(id) => open(id)} />}

          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-auto flex items-baseline gap-2">
              <h2 className="font-display text-2xl font-bold">Поставщики</h2>
              <span
                className={cn(
                  "text-muted-foreground tabular transition-opacity",
                  isFetching && "opacity-50",
                )}
              >
                {data?.total ?? "…"}
              </span>
            </div>

            <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="secondary" className="lg:hidden">
                  <SlidersHorizontal /> Фильтры
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto bg-card">
                <SheetTitle className="sr-only">Фильтры</SheetTitle>
                <div className="pt-6">{filtersPanel}</div>
              </SheetContent>
            </Sheet>

            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as SortKey);
                setOrder(v === "score" ? "desc" : "asc");
              }}
            >
              <SelectTrigger className="w-40 bg-card" aria-label="Сортировка">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {SORT_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div
              className="flex rounded-xl bg-card p-1 shadow-card"
              role="group"
              aria-label="Вид списка"
            >
              {(
                [
                  ["cards", LayoutGrid, "Карточки"],
                  ["table", Rows3, "Таблица"],
                ] as const
              ).map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors",
                    view === v
                      ? "bg-ink text-ink-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {isLoading || !data ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-3xl" />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <EmptyState
              onReset={() => {
                resetFilters();
                setBrief(null);
              }}
            />
          ) : view === "cards" ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {data.items.map((s) => (
                <SupplierCard
                  key={s.id}
                  supplier={s}
                  note={notes[s.id]}
                  selected={selectedIds.includes(s.id)}
                  compareDisabled={selected.length >= 3}
                  onToggleCompare={() => toggleCompare(s)}
                  onOpen={(n) => open(s.id, n)}
                />
              ))}
            </div>
          ) : (
            <TableView
              items={data.items}
              notes={notes}
              selected={selectedIds}
              sort={sort}
              order={order}
              onSort={onTableSort}
              onToggleCompare={(id) => {
                const s = data.items.find((x) => x.id === id);
                if (s) toggleCompare(s);
              }}
              onOpen={(id) => open(id)}
            />
          )}

          {data && totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1.5" aria-label="Страницы">
              <Button
                variant="secondary"
                size="icon"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Назад"
              >
                <ChevronLeft />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "ink" : "ghost"}
                  size="icon"
                  onClick={() => setPage(p)}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="icon"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Вперёд"
              >
                <ChevronRight />
              </Button>
            </nav>
          )}
        </div>
      </main>

      <CompareBar
        count={selected.length}
        names={selected.map((s) => s.name)}
        onCompare={() => setCompareOpen(true)}
        onClear={() => setSelected([])}
      />

      <CompareModal
        open={compareOpen}
        ids={selectedIds}
        brief={brief}
        onClose={() => setCompareOpen(false)}
        onRemove={(id) => setSelected((prev) => prev.filter((s) => s.id !== id))}
      />

      <SupplierDialog
        id={openId}
        brief={brief}
        focusNotes={focusNotes}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
