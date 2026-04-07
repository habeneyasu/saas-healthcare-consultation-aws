import os
import json
import httpx
import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from prompts import build_idea_messages, build_consultation_messages

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Platform API",
    description="SaaS idea generation and health consultation via Cerebras inference.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"

rate_limit_store: dict[str, dict[str, list[float]]] = {}
LIMITS = {"free": (3, 86400), "pro": (20, 86400)}


def check_rate_limit(ip: str, tier: str):
    max_req, window = LIMITS[tier]
    now = time.time()
    store = rate_limit_store.setdefault(ip, {"free": [], "pro": []})
    hits = [t for t in store[tier] if now - t < window]
    if len(hits) >= max_req:
        detail = "3 requests/day on the free tier. Sign in for more." if tier == "free" else "Daily limit reached."
        raise HTTPException(status_code=429, detail=detail)
    hits.append(now)
    store[tier] = hits


def is_authenticated(request: Request) -> bool:
    auth = request.headers.get("Authorization", "")
    return auth.startswith("Bearer ") and len(auth) > 10


def stream_cerebras(api_key: str, model: str, messages: list):
    with httpx.stream(
        "POST",
        CEREBRAS_API_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"model": model, "messages": messages, "stream": True},
        timeout=60.0,
    ) as response:
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Cerebras API error.")
        for line in response.iter_lines():
            if line.startswith("data: ") and line != "data: [DONE]":
                chunk = json.loads(line[6:])
                delta = chunk["choices"][0]["delta"].get("content", "")
                if delta:
                    yield delta


def get_config(request: Request):
    api_key = os.getenv("CEREBRAS_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="CEREBRAS_API_KEY is not configured.")
    model = os.getenv("CEREBRAS_MODEL", "llama3.1-8b")
    tier = "pro" if is_authenticated(request) else "free"
    return api_key, model, tier


@app.get("/api/ideas", summary="Generate AI SaaS Ideas", tags=["Ideas"])
def generate_ideas(request: Request):
    api_key, model, tier = get_config(request)
    check_rate_limit(request.client.host, tier)

    logger.info(f"[IDEAS/{tier.upper()}] {request.client.host}")
    start = time.time()

    def generate():
        yield from stream_cerebras(api_key, model, build_idea_messages(pro=tier == "pro"))
        logger.info(f"[IDEAS/{tier.upper()}] completed in {time.time() - start:.2f}s")

    return StreamingResponse(generate(), media_type="text/plain")


class ConsultationRequest(BaseModel):
    name: str
    date: str
    complaint: str


@app.post("/api/consultation", summary="Health Consultation", tags=["Health"])
def health_consultation(body: ConsultationRequest, request: Request):
    api_key, model, tier = get_config(request)
    check_rate_limit(request.client.host, tier)

    logger.info(f"[CONSULTATION/{tier.upper()}] {request.client.host}")
    start = time.time()

    def generate():
        yield from stream_cerebras(api_key, model, build_consultation_messages(body.name, body.date, body.complaint))
        logger.info(f"[CONSULTATION/{tier.upper()}] completed in {time.time() - start:.2f}s")

    return StreamingResponse(generate(), media_type="text/plain")


@app.get("/health", summary="Health Check", tags=["System"])
def health():
    return {"status": "ok", "model": os.getenv("CEREBRAS_MODEL", "llama3.1-8b")}
