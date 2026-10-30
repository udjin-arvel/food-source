// In-browser эмуляция FastAPI-бэкенда. Используется, когда VITE_API_URL не задан.
// Повторяет контракт эндпоинтов из ТЗ (раздел 5).
import {
  CATEGORY_LABELS,
  type CompareResponse,
  type ListParams,
  type ListResponse,
  type MetaResponse,
  type QueryBrief,
  type RecommendResponse,
  type Supplier,
  type SupplierFilters,
  type SupplierWithScore,
} from "../types";
import { SEED_SUPPLIERS } from "./seed";
import { DEFAULT_WEIGHTS, scoreSupplier } from "./scoring";

const db: Supplier[] = SEED_SUPPLIERS;

function filtersToBrief(f: SupplierFilters): QueryBrief {
  return {
    category: f.category,
    region: f.region,
    need_certificates: f.has_certificates || undefined,
    max_min_order: f.min_order_max,
    max_min_order_unit: f.min_order_unit,
  };
}

function applyFilters(list: Supplier[], f: SupplierFilters): Supplier[] {
  const q = f.q?.trim().toLowerCase();
  return list.filter((s) => {
    if (f.category && s.category !== f.category) return false;
    if (f.region && s.region !== f.region) return false;
    if (f.city && s.city !== f.city) return false;
    if (f.has_certificates && !s.has_certificates) return false;
    if (f.min_order_max != null) {
      if (s.min_order_value == null) return false;
      if (f.min_order_unit && s.min_order_unit !== f.min_order_unit) return false;
      if (s.min_order_value > f.min_order_max) return false;
    }
    if (q) {
      const hay = `${s.name} ${s.description ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function withScore(s: Supplier, brief: QueryBrief): SupplierWithScore {
  return { ...s, ...scoreSupplier(s, brief, DEFAULT_WEIGHTS), rank_badge: null };
}

function byScore(a: SupplierWithScore, b: SupplierWithScore) {
  return b.score - a.score || a.name.localeCompare(b.name, "ru");
}

function nullsLast(a: number | null, b: number | null, dir: 1 | -1) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return (a - b) * dir;
}

export function listSuppliers(params: ListParams): ListResponse {
  const { sort = "score", order, page = 1, page_size = 9, brief, ...filters } = params;
  const context = brief ?? filtersToBrief(filters);
  const scored = applyFilters(db, filters).map((s) => withScore(s, context));

  // Бейджи: при активном brief — топ-1 «Лучший выбор», без brief — подсветка топ-3
  const ranked = [...scored].sort(byScore);
  if (brief) {
    if (ranked[0] && ranked[0].score > 0) ranked[0].rank_badge = "best";
  } else {
    ranked.slice(0, 3).forEach((s) => (s.rank_badge = "top"));
  }

  const dir: 1 | -1 = (order ?? (sort === "score" ? "desc" : "asc")) === "asc" ? 1 : -1;
  const sorted = [...scored].sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name, "ru") * dir;
      case "min_order":
        return nullsLast(a.min_order_value, b.min_order_value, dir) || byScore(a, b);
      case "price":
        return nullsLast(a.price_per_unit, b.price_per_unit, dir) || byScore(a, b);
      default:
        return (a.score - b.score) * dir || a.name.localeCompare(b.name, "ru");
    }
  });

  const start = (page - 1) * page_size;
  return { items: sorted.slice(start, start + page_size), total: sorted.length, page, page_size };
}

export function getSupplier(id: number, brief?: QueryBrief | null): SupplierWithScore {
  const s = db.find((x) => x.id === id);
  if (!s) throw new Error("Поставщик не найден");
  return withScore(s, brief ?? {});
}

export function compare(ids: number[], brief?: QueryBrief | null): CompareResponse {
  if (ids.length < 2 || ids.length > 3) throw new Error("Для сравнения выберите 2–3 поставщика");
  const items = ids.map((id) => getSupplier(id, brief));

  const minOf = (vals: (number | null)[]) => {
    const nums = vals.filter((v): v is number => v != null);
    return nums.length ? Math.min(...nums) : null;
  };
  // Значения сравниваются только в одной единице измерения (кг с шт не сравниваем)
  const sameUnit = (key: "min_order_value" | "price_per_unit") => {
    const withValue = items.filter((i) => i[key] != null);
    return (
      new Set(withValue.map((i) => i.min_order_unit)).size === 1 &&
      !withValue.some((i) => !i.min_order_unit)
    );
  };
  const minMoq = sameUnit("min_order_value") ? minOf(items.map((i) => i.min_order_value)) : null;
  const minPrice = sameUnit("price_per_unit") ? minOf(items.map((i) => i.price_per_unit)) : null;
  const maxScore = Math.max(...items.map((i) => i.score));

  return {
    items,
    best: {
      min_order:
        minMoq == null ? [] : items.filter((i) => i.min_order_value === minMoq).map((i) => i.id),
      price_per_unit:
        minPrice == null ? [] : items.filter((i) => i.price_per_unit === minPrice).map((i) => i.id),
      certificates: items.filter((i) => i.has_certificates).map((i) => i.id),
      score: items.filter((i) => i.score === maxScore).map((i) => i.id),
    },
  };
}

export function recommend(brief: QueryBrief, limit = 3): RecommendResponse {
  const ranked = db
    .map((s) => withScore(s, brief))
    .sort(byScore)
    .slice(0, limit);
  if (ranked[0]) ranked[0].rank_badge = "best";

  const parts: string[] = [];
  if (brief.category) parts.push(`категория «${CATEGORY_LABELS[brief.category]}»`);
  if (brief.region) parts.push(brief.region);
  if (brief.max_min_order != null)
    parts.push(`MOQ ≤ ${brief.max_min_order} ${brief.max_min_order_unit ?? ""}`.trim());
  if (brief.need_certificates) parts.push("нужны сертификаты");
  if (brief.budget_per_unit != null) parts.push(`бюджет ≤ ${brief.budget_per_unit} ₽/ед.`);

  const top = ranked[0];
  const explanation = top
    ? `По запросу (${parts.join(", ") || "без ограничений"}) выше всех «${top.name}» — ${top.score} из 100: ${top.score_reasons.slice(0, 3).join(", ").toLowerCase() || "лучшее совпадение"}.`
    : "Подходящих поставщиков не найдено.";

  return { items: ranked, explanation, weights: DEFAULT_WEIGHTS };
}

export function meta(): MetaResponse {
  const regions = [...new Set(db.map((s) => s.region))].sort((a, b) => a.localeCompare(b, "ru"));
  const cityMap = new Map<string, string>();
  db.forEach((s) => cityMap.set(s.city, s.region));
  return {
    categories: (Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map((value) => ({
      value,
      label: CATEGORY_LABELS[value],
    })),
    regions,
    cities: [...cityMap.entries()]
      .map(([city, region]) => ({ city, region }))
      .sort((a, b) => a.city.localeCompare(b.city, "ru")),
    units: ["кг", "шт", "упак"],
  };
}
