from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import engine, init_db
from app.seed import run_seed
from sqlmodel import Session


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with Session(engine) as session:
        run_seed(session)
    yield


app = FastAPI(title="FoodSource API", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}
