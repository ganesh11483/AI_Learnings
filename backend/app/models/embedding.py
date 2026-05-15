import os
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

# Conditionally import pgvector only for production
if not os.getenv("TESTING"):
    from pgvector.sqlalchemy import Vector
    EMBEDDING_TYPE = Vector(1536)
else:
    # Use Text for testing (SQLite doesn't support pgvector)
    EMBEDDING_TYPE = Text


class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(EMBEDDING_TYPE)
    meta_data = Column(Text)  # Renamed from 'metadata' (reserved in SQLAlchemy)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
