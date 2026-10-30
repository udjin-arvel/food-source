from dataclasses import dataclass
from datetime import date, datetime, timezone
from typing import Optional

from app.models import Category, MoqUnit, Supplier
from app.schemas import QueryBrief, ScoringWeights, SupplierFlag

DEFAULT_WEIGHTS = ScoringWeights(
    category=30,
    region=20,
    certificates=20,
    moq=15,
    contacts=10,
    freshness=5,
    budget=10,
)

STALE_DAYS = 180


def days_since(source_date: date, now: datetime | None = None) -> int:
    if now is None:
        now = datetime.now(timezone.utc)
    ref = datetime.combine(source_date, datetime.min.time(), tzinfo=timezone.utc)
    return int((now - ref).total_seconds() // 86_400)


def contacts_filled(s: Supplier) -> int:
    return sum(
        1
        for v in (s.contact_phone, s.contact_email, s.website)
        if v and str(v).strip()
    )


def get_flags(s: Supplier, now: datetime | None = None) -> list[SupplierFlag]:
    flags: list[SupplierFlag] = []
    if not s.contact_phone and not s.contact_email:
        flags.append("no_contacts")
    if days_since(s.source_date, now) > STALE_DAYS:
        flags.append("stale")
    return flags


@dataclass
class ScoreResult:
    score: int
    score_reasons: list[str]
    score_breakdown: list[dict[str, int | str]]
    flags: list[SupplierFlag]


def score_supplier(
    s: Supplier,
    brief: QueryBrief,
    weights: ScoringWeights = DEFAULT_WEIGHTS,
    now: datetime | None = None,
) -> ScoreResult:
    if now is None:
        now = datetime.now(timezone.utc)

    breakdown: list[dict[str, int | str]] = []
    reasons: list[str] = []

    if brief.category is not None:
        ok = s.category == brief.category
        breakdown.append(
            {"label": "Категория", "points": weights.category if ok else 0, "max": weights.category}
        )
        if ok:
            reasons.append("Совпадает категория")

    if brief.region:
        ok = s.region == brief.region
        breakdown.append(
            {"label": "Регион", "points": weights.region if ok else 0, "max": weights.region}
        )
        if ok:
            reasons.append("Совпадает регион")

    if brief.need_certificates:
        ok = s.has_certificates
        breakdown.append(
            {
                "label": "Сертификаты",
                "points": weights.certificates if ok else 0,
                "max": weights.certificates,
            }
        )
        if ok:
            first = (s.certificates or "").split(",")[0].strip()
            reasons.append(f"Есть {first}" if first else "Есть сертификаты")

    if brief.max_min_order is not None:
        same_unit = not brief.max_min_order_unit or s.min_order_unit == brief.max_min_order_unit
        ok = (
            s.min_order_value is not None
            and same_unit
            and s.min_order_value <= brief.max_min_order
        )
        breakdown.append({"label": "MOQ", "points": weights.moq if ok else 0, "max": weights.moq})
        if ok:
            reasons.append("MOQ ниже вашего запроса")

    if brief.budget_per_unit is not None:
        ok = s.price_per_unit is not None and s.price_per_unit <= brief.budget_per_unit
        breakdown.append(
            {"label": "Бюджет", "points": weights.budget if ok else 0, "max": weights.budget}
        )
        if ok:
            reasons.append("Цена в рамках бюджета")

    if not breakdown:
        certs = s.has_certificates
        breakdown.append(
            {
                "label": "Сертификаты",
                "points": weights.certificates if certs else 0,
                "max": weights.certificates,
            }
        )
        if certs:
            first = (s.certificates or "").split(",")[0].strip()
            reasons.append(f"Есть {first}" if first else "Есть сертификаты")

        moq_known = s.min_order_value is not None
        breakdown.append(
            {"label": "MOQ указан", "points": weights.moq if moq_known else 0, "max": weights.moq}
        )
        if moq_known:
            reasons.append("Известен MOQ")

        price_known = s.price_per_unit is not None
        breakdown.append(
            {
                "label": "Цена указана",
                "points": weights.budget if price_known else 0,
                "max": weights.budget,
            }
        )
        if price_known:
            reasons.append("Известна цена")

    filled = contacts_filled(s)
    contact_points = round(weights.contacts * filled / 3)
    breakdown.append(
        {"label": "Контакты", "points": contact_points, "max": weights.contacts}
    )
    if filled == 3:
        reasons.append("Полные контакты")
    elif filled > 0:
        reasons.append(f"Контакты: {filled} из 3")

    fresh = days_since(s.source_date, now) < STALE_DAYS
    breakdown.append(
        {"label": "Актуальность", "points": weights.freshness if fresh else 0, "max": weights.freshness}
    )
    if fresh:
        reasons.append("Свежие данные")

    max_pts = sum(int(b["max"]) for b in breakdown)
    got = sum(int(b["points"]) for b in breakdown)
    score = 0 if max_pts == 0 else round(got / max_pts * 100)

    return ScoreResult(
        score=score,
        score_reasons=reasons,
        score_breakdown=breakdown,
        flags=get_flags(s, now),
    )
