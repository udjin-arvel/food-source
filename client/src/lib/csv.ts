import { CATEGORY_LABELS, type SupplierWithScore } from "./api/types";
import { STATUS_LABELS, type UserNote } from "@/hooks/use-notes";

const COLUMNS: [string, (s: SupplierWithScore, n?: UserNote) => unknown][] = [
  ["Название", (s) => s.name],
  ["Категория", (s) => CATEGORY_LABELS[s.category]],
  ["Город", (s) => s.city],
  ["Регион", (s) => s.region],
  ["MOQ", (s) => s.min_order],
  ["Цена", (s) => s.price_info],
  ["Цена за ед., ₽", (s) => s.price_per_unit],
  ["Сертификаты", (s) => s.certificates],
  ["Доставка", (s) => s.delivery_terms],
  ["Контакт", (s) => s.contact_name],
  ["Телефон", (s) => s.contact_phone],
  ["Email", (s) => s.contact_email],
  ["Сайт", (s) => s.website],
  ["Источник", (s) => s.source],
  ["Дата источника", (s) => s.source_date],
  ["Скор", (s) => s.score],
  ["Почему", (s) => s.score_reasons.join("; ")],
  ["Мой статус", (_s, n) => (n ? STATUS_LABELS[n.status] : "")],
  ["Моя заметка", (_s, n) => n?.text ?? ""],
];

function cell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  const s = String(v).replace(/"/g, '""');
  return /[";\n]/.test(s) ? `"${s}"` : s;
}

export function toCsv(items: SupplierWithScore[], notes: Record<number, UserNote> = {}): string {
  const head = COLUMNS.map(([h]) => h).join(";");
  const body = items.map((s) => COLUMNS.map(([, get]) => cell(get(s, notes[s.id]))).join(";"));
  return [head, ...body].join("\n");
}

export function downloadCsv(items: SupplierWithScore[], notes: Record<number, UserNote> = {}) {
  // BOM + «;» — чтобы Excel корректно открыл кириллицу
  const blob = new Blob(["\uFEFF" + toCsv(items, notes)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `foodsource-shortlist-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
