from __future__ import annotations

from sqlmodel import Session, select

from app.models import Category, MoqUnit, Supplier
from app.schemas import (
    CATEGORY_LABELS,
    ListResponse,
    MetaResponse,
    QueryBrief,
    SupplierFilters,
    SupplierWithScore,
)
from app.services.list_params import ListParams
from app.services.scoring import DEFAULT_WEIGHTS, ScoreResult, score_supplier


def filters_to_brief(filters: SupplierFilters) -> QueryBrief:
    return QueryBrief(
        category=filters.category,
        region=filters.region,
        need_certificates=True if filters.has_certificates else None,
        max_min_order=filters.min_order_max,
        max_min_order_unit=filters.min_order_unit,
    )


def apply_filters(suppliers: list[Supplier], f: SupplierFilters) -> list[Supplier]:
    q = (f.q or "").strip().lower()
    result: list[Supplier] = []
    for s in suppliers:
        if f.category and s.category != f.category:
            continue
        if f.region and s.region != f.region:
            continue
        if f.city and s.city != f.city:
            continue
        if f.has_certificates and not s.has_certificates:
            continue
        if f.min_order_max is not None:
            if s.min_order_value is None:
                continue
            if f.min_order_unit and s.min_order_unit != f.min_order_unit:
                continue
            if s.min_order_value > f.min_order_max:
                continue
        if q:
            hay = f"{s.name} {s.description or ''}".lower()
            if q not in hay:
                continue
        result.append(s)
    return result


def with_score(s: Supplier, brief: QueryBrief) -> SupplierWithScore:
    scored = score_supplier(s, brief, DEFAULT_WEIGHTS)
    return _to_supplier_with_score(s, scored, rank_badge=None)


def _to_supplier_with_score(
    s: Supplier,
    scored: ScoreResult,
    rank_badge: str | None,
) -> SupplierWithScore:
    data = s.model_dump()
    return SupplierWithScore(
        **data,
        score=scored.score,
        score_reasons=scored.score_reasons,
        score_breakdown=scored.score_breakdown,
        flags=scored.flags,
        rank_badge=rank_badge,
    )


def by_score(a: SupplierWithScore, b: SupplierWithScore) -> int:
    if b.score != a.score:
        return b.score - a.score
    return -1 if a.name < b.name else (1 if a.name > b.name else 0)


def nulls_last(a: float | None, b: float | None, direction: int) -> int:
    if a is None and b is None:
        return 0
    if a is None:
        return 1
    if b is None:
        return -1
    return int((a - b) * direction)


def apply_rank_badges(
    items: list[SupplierWithScore], brief_active: bool
) -> None:
    ranked = sorted(items, key=lambda x: (-x.score, x.name))
    if brief_active:
        if ranked and ranked[0].score > 0:
            ranked[0].rank_badge = "best"
    else:
        for s in ranked[:3]:
            s.rank_badge = "top"


def list_suppliers(session: Session, params: ListParams) -> ListResponse:
    db = session.exec(select(Supplier)).all()
    context = params.brief if params.brief is not None else filters_to_brief(params)
    brief_active = params.brief is not None

    filtered = apply_filters(list(db), params)
    scored = [with_score(s, context) for s in filtered]
    apply_rank_badges(scored, brief_active)

    sort = params.sort
    order = params.order or ("desc" if sort == "score" else "asc")
    direction = 1 if order == "asc" else -1

    def sort_key(a: SupplierWithScore, b: SupplierWithScore) -> int:
        if sort == "name":
            cmp = (a.name > b.name) - (a.name < b.name)
            return cmp * direction
        if sort == "min_order":
            n = nulls_last(a.min_order_value, b.min_order_value, direction)
            return n if n else by_score(a, b)
        if sort == "price":
            n = nulls_last(a.price_per_unit, b.price_per_unit, direction)
            return n if n else by_score(a, b)
        if a.score != b.score:
            return (a.score - b.score) * direction
        return (a.name > b.name) - (a.name < b.name)

    from functools import cmp_to_key

    sorted_items = sorted(scored, key=cmp_to_key(sort_key))

    start = (params.page - 1) * params.page_size
    page_items = sorted_items[start : start + params.page_size]

    return ListResponse(
        items=page_items,
        total=len(sorted_items),
        page=params.page,
        page_size=params.page_size,
    )


def get_supplier(session: Session, supplier_id: int, brief: QueryBrief | None) -> SupplierWithScore:
    s = session.get(Supplier, supplier_id)
    if s is None:
        raise LookupError("Поставщик не найден")
    return with_score(s, brief or QueryBrief())


def build_meta(session: Session) -> MetaResponse:
    db = session.exec(select(Supplier)).all()
    regions = sorted({s.region for s in db}, key=lambda r: r.lower())
    city_map: dict[str, str] = {s.city: s.region for s in db}
    cities = sorted(
        [{"city": city, "region": region} for city, region in city_map.items()],
        key=lambda c: c["city"].lower(),
    )
    return MetaResponse(
        categories=[
            {"value": cat.value, "label": CATEGORY_LABELS[cat]} for cat in Category
        ],
        regions=regions,
        cities=cities,
        units=[MoqUnit.kg, MoqUnit.pcs, MoqUnit.pack],
    )
