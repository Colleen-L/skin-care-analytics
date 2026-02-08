from sqlalchemy import Column, Date, Integer, String, Text, ForeignKey, Boolean, Table, DateTime
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
    
    # Relationships
    entries = relationship("SkinCareEntry", back_populates="user")
    skin_analyses = relationship("SkinAnalysis", back_populates="user")


class SkinCareEntry(Base):
    __tablename__ = "skincare_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    image_path = Column(String, nullable=True)
    analysis_result = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    skin_condition = Column(String, nullable=True)  # e.g., "Clear", "Oily", "Dry", "Acne"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="entries")
    products = relationship("ProductUsage", back_populates="entry")


class ProductUsage(Base):
    __tablename__ = "product_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("skincare_entries.id"))
    product_name = Column(String, nullable=False)
    product_type = Column(String, nullable=True)  # e.g., "Cleanser", "Moisturizer", "Serum"
    time_of_day = Column(String, nullable=True)  # e.g., "Morning", "Evening"
    
    # Relationships
    entry = relationship("SkinCareEntry", back_populates="products")


class SkinAnalysis(Base):
    __tablename__ = "skin_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    result = Column(Text, nullable=True)  # Store the JSON result as text
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="skin_analyses")