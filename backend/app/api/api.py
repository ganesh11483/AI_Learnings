from fastapi import APIRouter
from app.api import auth, documents, patients, claims, mcp

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(claims.router, prefix="/claims", tags=["claims"])
api_router.include_router(mcp.router, prefix="/mcp", tags=["mcp"])
