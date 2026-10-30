from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models import Category, MoqUnit


class QueryBrief(BaseModel):
    category: Optional[Category] = None
    region: Optional[str] = None
    max_min_order: Optional[float] = None
    max_min_order_unit: Optional[MoqUnit] = None
    need_certificates: Optional[bool] = None
    budget_per_unit: Optional[float] = None


class SupplierFilters(BaseModel):
    category: Optional[Category] = None
    region: Optional[str] = None
    city: Optional[str] = None
    has_certificates: Optional[bool] = None
    min_order_max: Optional[float] = None
    min_order_unit: Optional[MoqUnit] = None
    q: Optional[str] = None


class ScoringWeights(BaseModel):
    category: int = 30
    region: int = 20
    certificates: int = 20
    moq: int = 15
    contacts: int = 10
    freshness: int = 5
    budget: int = 10


class SupplierBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: Category
    city: str
    region: str
    description: Optional[str] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    source: str
    source_date: date
    min_order: Optional[str] = None
    min_order_value: Optional[float] = None
    min_order_unit: Optional[MoqUnit] = None
    price_info: Optional[str] = None
    price_per_unit: Optional[float] = None
    has_certificates: bool
    certificates: Optional[str] = None
    delivery_terms: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime


class ScoreBreakdownItem(BaseModel):
    label: str
    points: int
    max: int


SupplierFlag = Literal["no_contacts", "stale"]
RankBadge = Literal["best", "top"]


class SupplierWithScore(SupplierBase):
    score: int
    score_reasons: list[str]
    score_breakdown: list[ScoreBreakdownItem]
    flags: list[SupplierFlag]
    rank_badge: Optional[RankBadge] = None


class ListResponse(BaseModel):
    items: list[SupplierWithScore]
    total: int
    page: int
    page_size: int


CATEGORY_LABELS: dict[Category, str] = {
    Category.ingredients: "Ингредиенты",
    Category.finished: "Готовая продукция",
    Category.packaging: "Упаковка",
}


class MetaResponse(BaseModel):
    categories: list[dict[str, str]]
    regions: list[str]
    cities: list[dict[str, str]]
    units: list[MoqUnit]
