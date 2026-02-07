from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, Table, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
import secrets

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(128), nullable=True)       
    verification_token_expires = Column(DateTime, nullable=True) 