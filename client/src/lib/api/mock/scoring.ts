// Прозрачный скоринг (ТЗ, раздел 6). Логика эквивалентна services/scoring.py на бэкенде.
import type {
  QueryBrief,
  ScoringWeights,
  Supplier,
  SupplierFlag,
  SupplierWithScore,
} from "../types";

export const DEFAULT_WEIGHTS: ScoringWeights = {
  category: 30,
  region: 20,
  certificates: 20,
  moq: 15,
  contacts: 10,
  freshness: 5,
  budget: 10,
};

export const STALE_DAYS = 180;

export function daysSince(date: string, now: Date = new Date()): number {
  const d = new Date(date + "T00:00:00Z").getTime();
  return Math.floor((now.getTime() - d) / 86_400_000);
}

export function contactsFilled(s: Supplier): number {
  return [s.contact_phone, s.contact_email, s.website].filter((v) => !!v && v.trim() !== "").length;
}

export function getFlags(s: Supplier, now: Date = new Date()): SupplierFlag[] {
  const flags: SupplierFlag[] = [];
  if (!s.contact_phone && !s.contact_email) flags.push("no_contacts");
  if (daysSince(s.source_date, now) > STALE_DAYS) flags.push("stale");
  return flags;
}

/**
 * Скор 0–100: сумма сработавших критериев, нормированная на максимум
 * по критериям, которые применимы к текущему запросу.
 * Контакты и актуальность применимы всегда.
 */
export function scoreSupplier(
  s: Supplier,
  brief: QueryBrief,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  now: Date = new Date(),
): Pick<SupplierWithScore, "score" | "score_reasons" | "score_breakdown" | "flags"> {
  const breakdown: SupplierWithScore["score_breakdown"] = [];
  const reasons: string[] = [];

  if (brief.category) {
    const ok = s.category === brief.category;
    breakdown.push({
      label: "Категория",
      points: ok ? weights.category : 0,
      max: weights.category,
    });
    if (ok) reasons.push("Совпадает категория");
  }

  if (brief.region) {
    const ok = s.region === brief.region;
    breakdown.push({ label: "Регион", points: ok ? weights.region : 0, max: weights.region });
    if (ok) reasons.push("Совпадает регион");
  }

  if (brief.need_certificates) {
    const ok = s.has_certificates;
    breakdown.push({
      label: "Сертификаты",
      points: ok ? weights.certificates : 0,
      max: weights.certificates,
    });
    if (ok) {
      const first = s.certificates?.split(",")[0]?.trim();
      reasons.push(first ? `Есть ${first}` : "Есть сертификаты");
    }
  }

  if (brief.max_min_order != null) {
    const sameUnit = !brief.max_min_order_unit || s.min_order_unit === brief.max_min_order_unit;
    const ok = s.min_order_value != null && sameUnit && s.min_order_value <= brief.max_min_order;
    breakdown.push({ label: "MOQ", points: ok ? weights.moq : 0, max: weights.moq });
    if (ok) reasons.push("MOQ ниже вашего запроса");
  }

  if (brief.budget_per_unit != null) {
    const ok = s.price_per_unit != null && s.price_per_unit <= brief.budget_per_unit;
    breakdown.push({ label: "Бюджет", points: ok ? weights.budget : 0, max: weights.budget });
    if (ok) reasons.push("Цена в рамках бюджета");
  }

  // Без запроса и фильтров оцениваем надёжность и полноту карточки,
  // чтобы скор в общем списке не был у всех одинаковым.
  if (breakdown.length === 0) {
    const certs = s.has_certificates;
    breakdown.push({
      label: "Сертификаты",
      points: certs ? weights.certificates : 0,
      max: weights.certificates,
    });
    if (certs) {
      const first = s.certificates?.split(",")[0]?.trim();
      reasons.push(first ? `Есть ${first}` : "Есть сертификаты");
    }
    const moqKnown = s.min_order_value != null;
    breakdown.push({ label: "MOQ указан", points: moqKnown ? weights.moq : 0, max: weights.moq });
    if (moqKnown) reasons.push("Известен MOQ");
    const priceKnown = s.price_per_unit != null;
    breakdown.push({
      label: "Цена указана",
      points: priceKnown ? weights.budget : 0,
      max: weights.budget,
    });
    if (priceKnown) reasons.push("Известна цена");
  }

  const filled = contactsFilled(s);
  const contactPoints = Math.round((weights.contacts * filled) / 3);
  breakdown.push({ label: "Контакты", points: contactPoints, max: weights.contacts });
  if (filled === 3) reasons.push("Полные контакты");
  else if (filled > 0) reasons.push(`Контакты: ${filled} из 3`);

  const fresh = daysSince(s.source_date, now) < STALE_DAYS;
  breakdown.push({
    label: "Актуальность",
    points: fresh ? weights.freshness : 0,
    max: weights.freshness,
  });
  if (fresh) reasons.push("Свежие данные");

  const max = breakdown.reduce((a, b) => a + b.max, 0);
  const got = breakdown.reduce((a, b) => a + b.points, 0);
  const score = max === 0 ? 0 : Math.round((got / max) * 100);

  return { score, score_reasons: reasons, score_breakdown: breakdown, flags: getFlags(s, now) };
}
