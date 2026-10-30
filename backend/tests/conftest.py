import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app
from app.seed import run_seed


@pytest.fixture
def db_engine():
    with tempfile.TemporaryDirectory() as tmp:
        url = f"sqlite:///{tmp}/test.db"
        engine = create_engine(url, connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(engine)
        with Session(engine) as session:
            run_seed(session)
        yield engine
        engine.dispose()


@pytest.fixture
def client(db_engine):
    def override_session():
        with Session(db_engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
