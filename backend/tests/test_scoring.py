from datetime import date, datetime, timezone

from app.models import Category, MoqUnit, Supplier
from app.schemas import QueryBrief
from app.services.scoring import DEFAULT_WEIGHTS, score_supplier

NOW = datetime(2026, 10, 30, tzinfo=timezone.utc)

BASE = Supplier(
    id=1,
    name="Тест",
    category=Category.ingredients,
    city="Томск",
    region="Сибирский ФО",
    description=None,
    website="a.ru",
    contact_name=None,
    contact_phone="+7",
    contact_email="a@a.ru",
    source="Ручной ввод",
    source_date=date(2026, 10, 1),
    min_order="от 100 кг",
    min_order_value=100,
    min_order_unit=MoqUnit.kg,
    price_info=None,
    price_per_unit=200,
    has_certificates=True,
    certificates="ХАССП, ISO 22000",
    delivery_terms=None,
    notes=None,
    created_at=NOW,
)


def test_default_weights_match_spec():
    assert DEFAULT_WEIGHTS.category == 30
    assert DEFAULT_WEIGHTS.region == 20
    assert DEFAULT_WEIGHTS.certificates == 20
    assert DEFAULT_WEIGHTS.moq == 15
    assert DEFAULT_WEIGHTS.contacts == 10
    assert DEFAULT_WEIGHTS.freshness == 5


def test_full_match_scores_100():
    r = score_supplier(
        BASE,
        QueryBrief(
            category=Category.ingredients,
            region="Сибирский ФО",
            need_certificates=True,
            max_min_order=500,
            max_min_order_unit=MoqUnit.kg,
        ),
        now=NOW,
    )
    assert r.score == 100
    assert "Совпадает регион" in r.score_reasons
    assert "MOQ ниже вашего запроса" in r.score_reasons


def test_moq_not_awarded_when_above_request():
    r = score_supplier(
        BASE,
        QueryBrief(max_min_order=50, max_min_order_unit=MoqUnit.kg),
        now=NOW,
    )
    moq = next(b for b in r.score_breakdown if b["label"] == "MOQ")
    assert moq["points"] == 0


def test_stale_flag():
    stale = BASE.model_copy(update={"source_date": date(2026, 4, 1)})
    r = score_supplier(stale, QueryBrief(), now=NOW)
    assert "stale" in r.flags


def test_no_contacts_flag():
    bare = BASE.model_copy(update={"contact_phone": None, "contact_email": None})
    r = score_supplier(bare, QueryBrief(), now=NOW)
    assert "no_contacts" in r.flags
