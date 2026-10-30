from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.models import Category, MoqUnit
from app.schemas import (
    ListResponse,
    MetaResponse,
    QueryBrief,
    SupplierFilters,
    SupplierWithScore,
)


class ListParams(SupplierFilters):
    sort: Literal["score", "min_order", "price", "name"] = "score"
    order: Optional[Literal["asc", "desc"]] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=9, ge=1, le=100)
    brief: Optional[QueryBrief] = None
