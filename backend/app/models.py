from datetime import date, datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class Category(str, Enum):
    ingredients = "ingredients"
    finished = "finished"
    packaging = "packaging"


class MoqUnit(str, Enum):
    kg = "кг"
    pcs = "шт"
    pack = "упак"


class Supplier(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
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
    has_certificates: bool = False
    certificates: Optional[str] = None
    delivery_terms: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
