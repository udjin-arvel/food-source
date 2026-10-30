from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlmodel import Session

from app.database import engine, init_db
from app.routers.suppliers import router as suppliers_router
from app.seed import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with Session(engine) as session:
        run_seed(session)
    yield


app = FastAPI(title="FoodSource API", lifespan=lifespan)
app.include_router(suppliers_router)


@app.get("/health")
def health():
    return {"status": "ok"}
