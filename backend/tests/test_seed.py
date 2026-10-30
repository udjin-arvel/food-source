import os
import tempfile

import pytest
from sqlmodel import Session, select

from app.database import init_db
from app.models import Supplier
from app.seed import SEED_ROWS, run_seed
from sqlmodel import SQLModel, create_engine


@pytest.fixture
def db_session():
    with tempfile.TemporaryDirectory() as tmp:
        url = f"sqlite:///{tmp}/test.db"
        engine = create_engine(url, connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(engine)
        with Session(engine) as session:
            run_seed(session)
            yield session
        engine.dispose()


def test_seed_is_idempotent(db_session: Session):
    count = len(db_session.exec(select(Supplier)).all())
    assert count == len(SEED_ROWS)
    run_seed(db_session)
    assert len(db_session.exec(select(Supplier)).all()) == count


def test_seed_has_twenty_suppliers(db_session: Session):
    suppliers = db_session.exec(select(Supplier)).all()
    assert len(suppliers) == 20
