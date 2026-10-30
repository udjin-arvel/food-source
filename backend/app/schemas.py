from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict

from app.models import Category, MoqUnit


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
