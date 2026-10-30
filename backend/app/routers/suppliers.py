from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.database import get_session
from app.models import Category, MoqUnit
from app.schemas import ListResponse, MetaResponse, QueryBrief, SupplierWithScore
from app.services.list_params import ListParams
from app.services.suppliers import build_meta, get_supplier, list_suppliers

router = APIRouter()


def _parse_brief(
    brief_category: Optional[Category] = None,
    brief_region: Optional[str] = None,
    brief_max_min_order: Optional[float] = None,
    brief_max_min_order_unit: Optional[MoqUnit] = None,
    brief_need_certificates: Optional[bool] = None,
    brief_budget_per_unit: Optional[float] = None,
) -> Optional[QueryBrief]:
    if not any(
        v is not None
        for v in (
            brief_category,
            brief_region,
            brief_max_min_order,
            brief_max_min_order_unit,
            brief_need_certificates,
            brief_budget_per_unit,
        )
    ):
        return None
    return QueryBrief(
        category=brief_category,
        region=brief_region,
        max_min_order=brief_max_min_order,
        max_min_order_unit=brief_max_min_order_unit,
        need_certificates=brief_need_certificates,
        budget_per_unit=brief_budget_per_unit,
    )


@router.get("/suppliers", response_model=ListResponse)
def suppliers_list(
    session: Annotated[Session, Depends(get_session)],
    category: Optional[Category] = None,
    region: Optional[str] = None,
    city: Optional[str] = None,
    has_certificates: Optional[bool] = None,
    min_order_max: Optional[float] = None,
    min_order_unit: Optional[MoqUnit] = None,
    q: Optional[str] = None,
    sort: Annotated[str, Query()] = "score",
    order: Optional[str] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 9,
    brief_category: Optional[Category] = None,
    brief_region: Optional[str] = None,
    brief_max_min_order: Optional[float] = None,
    brief_max_min_order_unit: Optional[MoqUnit] = None,
    brief_need_certificates: Optional[bool] = None,
    brief_budget_per_unit: Optional[float] = None,
) -> ListResponse:
    brief = _parse_brief(
        brief_category,
        brief_region,
        brief_max_min_order,
        brief_max_min_order_unit,
        brief_need_certificates,
        brief_budget_per_unit,
    )
    params = ListParams(
        category=category,
        region=region,
        city=city,
        has_certificates=has_certificates,
        min_order_max=min_order_max,
        min_order_unit=min_order_unit,
        q=q,
        sort=sort,  # type: ignore[arg-type]
        order=order,  # type: ignore[arg-type]
        page=page,
        page_size=page_size,
        brief=brief,
    )
    return list_suppliers(session, params)


@router.get("/suppliers/{supplier_id}", response_model=SupplierWithScore)
def supplier_detail(
    supplier_id: int,
    session: Annotated[Session, Depends(get_session)],
    brief_category: Optional[Category] = None,
    brief_region: Optional[str] = None,
    brief_max_min_order: Optional[float] = None,
    brief_max_min_order_unit: Optional[MoqUnit] = None,
    brief_need_certificates: Optional[bool] = None,
    brief_budget_per_unit: Optional[float] = None,
) -> SupplierWithScore:
    brief = _parse_brief(
        brief_category,
        brief_region,
        brief_max_min_order,
        brief_max_min_order_unit,
        brief_need_certificates,
        brief_budget_per_unit,
    )
    try:
        return get_supplier(session, supplier_id, brief)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@router.get("/meta", response_model=MetaResponse)
def meta(session: Annotated[Session, Depends(get_session)]) -> MetaResponse:
    return build_meta(session)
