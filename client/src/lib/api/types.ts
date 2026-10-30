// Контракт API FoodSource (зеркалит схемы FastAPI из ТЗ, раздел 4–5).

export type Category = "ingredients" | "finished" | "packaging";
export type MoqUnit = "кг" | "шт" | "упак";

export interface Supplier {
  id: number;
  name: string;
  category: Category;
  city: string;
  region: string;
  description: string | null;
  website: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  source: string;
  source_date: string; // YYYY-MM-DD
  min_order: string | null;
  min_order_value: number | null;
  min_order_unit: MoqUnit | null;
  price_info: string | null;
  price_per_unit: number | null;
  has_certificates: boolean;
  certificates: string | null;
  delivery_terms: string | null;
  notes: string | null;
  created_at: string;
}

export type SupplierFlag = "no_contacts" | "stale";
export type RankBadge = "best" | "top" | null;

export interface SupplierWithScore extends Supplier {
  score: number;
  score_reasons: string[];
  /** Сколько баллов получено из максимально возможных по активным критериям */
  score_breakdown: { label: string; points: number; max: number }[];
  flags: SupplierFlag[];
  rank_badge: RankBadge;
}

export type SortKey = "score" | "min_order" | "price" | "name";
export type SortOrder = "asc" | "desc";

export interface QueryBrief {
  category?: Category | undefined;
  region?: string | undefined;
  max_min_order?: number | undefined;
  max_min_order_unit?: MoqUnit | undefined;
  need_certificates?: boolean | undefined;
  budget_per_unit?: number | undefined;
}

export interface SupplierFilters {
  category?: Category | undefined;
  region?: string | undefined;
  city?: string | undefined;
  has_certificates?: boolean | undefined;
  min_order_max?: number | undefined;
  min_order_unit?: MoqUnit | undefined;
  q?: string | undefined;
}

export interface ListParams extends SupplierFilters {
  sort?: SortKey | undefined;
  order?: SortOrder | undefined;
  page?: number | undefined;
  page_size?: number | undefined;
  /** Активный «Мой запрос» — влияет на скоринг и бейджи */
  brief?: QueryBrief | null | undefined;
}

export interface ListResponse {
  items: SupplierWithScore[];
  total: number;
  page: number;
  page_size: number;
}

export interface CompareResponse {
  items: SupplierWithScore[];
  best: {
    min_order: number[];
    price_per_unit: number[];
    certificates: number[];
    score: number[];
  };
}

export interface RecommendResponse {
  items: SupplierWithScore[];
  explanation: string;
  weights: ScoringWeights;
}

export interface ScoringWeights {
  category: number;
  region: number;
  certificates: number;
  moq: number;
  contacts: number;
  freshness: number;
  budget: number;
}

export interface MetaResponse {
  categories: { value: Category; label: string }[];
  regions: string[];
  cities: { city: string; region: string }[];
  units: MoqUnit[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  ingredients: "Ингредиенты",
  finished: "Готовая продукция",
  packaging: "Упаковка",
};
