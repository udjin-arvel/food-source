import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS, scoreSupplier } from "./scoring";
import { compare, listSuppliers, recommend } from "./server";
import type { Supplier } from "../types";

const now = new Date("2026-10-30T00:00:00Z");

const base: Supplier = {
  id: 1,
  name: "Тест",
  category: "ingredients",
  city: "Томск",
  region: "Сибирский ФО",
  description: null,
  website: "a.ru",
  contact_name: null,
  contact_phone: "+7",
  contact_email: "a@a.ru",
  source: "Ручной ввод",
  source_date: "2026-10-01",
  min_order: "от 100 кг",
  min_order_value: 100,
  min_order_unit: "кг",
  price_info: null,
  price_per_unit: 200,
  has_certificates: true,
  certificates: "ХАССП, ISO 22000",
  delivery_terms: null,
  notes: null,
  created_at: "2026-10-01T00:00:00Z",
};

describe("скоринг поставщиков", () => {
  it("использует веса из ТЗ: категория 30, регион 20, сертификаты 20, MOQ 15, контакты 10, свежесть 5", () => {
    expect(DEFAULT_WEIGHTS).toMatchObject({
      category: 30,
      region: 20,
      certificates: 20,
      moq: 15,
      contacts: 10,
      freshness: 5,
    });
  });

  it("даёт 100 при полном совпадении с запросом", () => {
    const r = scoreSupplier(
      base,
      {
        category: "ingredients",
        region: "Сибирский ФО",
        need_certificates: true,
        max_min_order: 500,
        max_min_order_unit: "кг",
      },
      DEFAULT_WEIGHTS,
      now,
    );
    expect(r.score).toBe(100);
    expect(r.score_reasons).toEqual(
      expect.arrayContaining(["Совпадает регион", "Есть ХАССП", "MOQ ниже вашего запроса"]),
    );
  });

  it("не начисляет MOQ, если минимальный заказ выше запрошенного", () => {
    const r = scoreSupplier(
      base,
      { max_min_order: 50, max_min_order_unit: "кг" },
      DEFAULT_WEIGHTS,
      now,
    );
    expect(r.score_breakdown.find((b) => b.label === "MOQ")?.points).toBe(0);
  });

  it("помечает данные старше 180 дней как устаревшие", () => {
    const r = scoreSupplier({ ...base, source_date: "2026-04-01" }, {}, DEFAULT_WEIGHTS, now);
    expect(r.flags).toContain("stale");
  });

  it("ставит бейдж «нет контактов», если нет ни телефона, ни email", () => {
    const r = scoreSupplier(
      { ...base, contact_phone: null, contact_email: null },
      {},
      DEFAULT_WEIGHTS,
      now,
    );
    expect(r.flags).toContain("no_contacts");
  });
});

describe("эндпоинты эмуляции", () => {
  it("при активном запросе «Лучший выбор» получает только топ-1", () => {
    const res = listSuppliers({ brief: { category: "ingredients" }, page_size: 50 });
    expect(res.items.filter((s) => s.rank_badge === "best")).toHaveLength(1);
    expect(res.items[0]?.rank_badge).toBe("best");
  });

  it("без запроса подсвечивает топ-3", () => {
    const res = listSuppliers({ page_size: 50 });
    expect(res.items.filter((s) => s.rank_badge === "top")).toHaveLength(3);
  });

  it("фильтры категории, региона и сертификатов работают совместно", () => {
    const res = listSuppliers({
      category: "ingredients",
      region: "Сибирский ФО",
      has_certificates: true,
      page_size: 50,
    });
    expect(res.total).toBeGreaterThan(0);
    res.items.forEach((s) => {
      expect(s.category).toBe("ingredients");
      expect(s.region).toBe("Сибирский ФО");
      expect(s.has_certificates).toBe(true);
    });
  });

  it("сравнение принимает только 2–3 поставщика и подсвечивает минимальную цену", () => {
    expect(() => compare([1])).toThrow();
    const res = compare([1, 7]); // 38 ₽/кг vs 95 ₽/кг
    expect(res.best.price_per_unit).toEqual([1]);
  });

  it("рекомендации отдают топ-3 с причинами", () => {
    const res = recommend({ category: "packaging", need_certificates: true });
    expect(res.items).toHaveLength(3);
    expect(res.items[0]?.score_reasons.length ?? 0).toBeGreaterThan(0);
  });
});

describe("сравнение и базовый скор", () => {
  it("не подсвечивает лучшую цену, если единицы разные (кг и шт)", () => {
    const res = compare([1, 9]); // мука ₽/кг vs выпечка ₽/шт
    expect(res.best.price_per_unit).toEqual([]);
  });

  it("без запроса скор зависит от сертификатов и полноты карточки", () => {
    const full = scoreSupplier(base, {}, DEFAULT_WEIGHTS, now);
    const bare = scoreSupplier(
      { ...base, has_certificates: false, min_order_value: null, price_per_unit: null },
      {},
      DEFAULT_WEIGHTS,
      now,
    );
    expect(full.score).toBe(100);
    expect(bare.score).toBeLessThan(40);
  });
});
