from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, ensure_schema_compatibility, engine
from app.routers import forms, logic, public, questions, responses
from app.seed import seed

ensure_schema_compatibility()
Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(title="Typeform Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(logic.router)
app.include_router(public.router)
app.include_router(responses.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
