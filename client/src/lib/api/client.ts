// Тонкий клиент FoodSource. Если задан VITE_API_URL — ходит в FastAPI,
// иначе использует встроенную эмуляцию бэкенда на демо-сиде.
import type {
  CompareResponse,
  ListParams,
  ListResponse,
  MetaResponse,
  QueryBrief,
  RecommendResponse,
  SupplierWithScore,
} from "./types";
import * as mock from "./mock/server";

const BASE_URL = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "");
export const IS_MOCK = !BASE_URL;

const delay = <T>(fn: () => T, ms = 180) =>
  new Promise<T>((resolve, reject) =>
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e);
      }
    }, ms),
  );

function toQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function briefToQuery(brief?: QueryBrief | null): Record<string, unknown> {
  if (!brief) return {};
  return Object.fromEntries(Object.entries(brief).map(([k, v]) => [`brief_${k}`, v]));
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  listSuppliers(params: ListParams): Promise<ListResponse> {
    if (IS_MOCK) return delay(() => mock.listSuppliers(params));
    const { brief, ...rest } = params;
    return http(`/suppliers${toQuery({ ...rest, ...briefToQuery(brief) })}`);
  },
  getSupplier(id: number, brief?: QueryBrief | null): Promise<SupplierWithScore> {
    if (IS_MOCK) return delay(() => mock.getSupplier(id, brief), 80);
    return http(`/suppliers/${id}${toQuery(briefToQuery(brief))}`);
  },
  compare(ids: number[], brief?: QueryBrief | null): Promise<CompareResponse> {
    if (IS_MOCK) return delay(() => mock.compare(ids, brief));
    return http(`/compare`, { method: "POST", body: JSON.stringify({ ids, brief }) });
  },
  recommend(brief: QueryBrief): Promise<RecommendResponse> {
    if (IS_MOCK) return delay(() => mock.recommend(brief), 260);
    return http(`/recommend`, { method: "POST", body: JSON.stringify(brief) });
  },
  meta(): Promise<MetaResponse> {
    if (IS_MOCK) return delay(() => mock.meta(), 0);
    return http(`/meta`);
  },
};
