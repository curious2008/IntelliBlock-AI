from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.errors import (
    AppException, app_exception_handler, http_exception_handler,
    validation_exception_handler, generic_exception_handler
)
from app.api.v1.router import api_router
from app.db.session import engine, Base
from app.services.ai.registry.model_store import model_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # If running against local SQLite fallback, ensure tables exist
    if engine.dialect.name == "sqlite":
        Base.metadata.create_all(bind=engine)
    
    # Load AI models from registry (silent if not yet trained)
    try:
        model_store.load_all()
        loaded = [m for m in model_store.list_models() if m["status"] == "LOADED"]
        print(f"[AI] Loaded {len(loaded)} model(s) from registry.")
    except Exception as e:
        print(f"[AI] Model loading warning: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [o.strip() for o in str(settings.CORS_ORIGINS).split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
