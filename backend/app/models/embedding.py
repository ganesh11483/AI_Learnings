import os
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Index, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.core.config import settings

# Try to import pgvector, but make it optional for SQLite compatibility
try:
    from pgvector.sqlalchemy import Vector
    HAS_PGVECTOR = True
except ImportError:
    HAS_PGVECTOR = False
    Vector = None  # Will use JSON as fallback


class Embedding(Base):
    """Vector embeddings for semantic search using pgvector (PostgreSQL) or JSON (SQLite)."""
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False, index=True)  # document, entity, claim, etc.
    entity_id = Column(Integer, nullable=False, index=True)
    content = Column(Text, nullable=False)  # Original text content
    
    # Use Vector for PostgreSQL, JSON for SQLite
    if HAS_PGVECTOR and settings.DATABASE_URL.startswith("postgresql"):
        embedding = Column(Vector(1536), nullable=False)  # OpenAI text-embedding-3-small produces 1536 dimensions
    else:
        embedding = Column(JSON, nullable=False)  # Store as JSON array for SQLite compatibility
    
    meta_data = Column(Text)  # JSON metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Add index for efficient vector similarity search
    __table_args__ = (
        Index('ix_embedding_entity', 'entity_type', 'entity_id'),
        Index('ix_embedding_created', 'created_at'),
    )
