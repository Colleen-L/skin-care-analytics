from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from db_conn import SessionLocal
from models import SkinCareEntry, ProductUsage, User
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date, datetime
import os
import shutil

router = APIRouter(prefix="/skincare", tags=["skincare"])

# Pydantic models for requests/responses
class ProductCreate(BaseModel):
    product_name: str
    product_type: Optional[str] = None
    time_of_day: Optional[str] = None

class EntryCreate(BaseModel):
    date: date
    skin_condition: Optional[str] = None
    notes: Optional[str] = None
    products: Optional[List[ProductCreate]] = []
    analysis_result: Optional[str] = None  # ← ADDED

class EntryUpdate(BaseModel):
    skin_condition: Optional[str] = None
    notes: Optional[str] = None
    products: Optional[List[ProductCreate]] = None
    analysis_result: Optional[str] = None  # ← ADDED

class EntryResponse(BaseModel):
    id: int
    date: date
    skin_condition: Optional[str]
    notes: Optional[str]
    image_path: Optional[str]
    analysis_result: Optional[str]
    products: List[ProductCreate]
    
    class Config:
        from_attributes = True

class CalendarEntryResponse(BaseModel):
    id: int
    skin_condition: Optional[str]
    has_image: bool

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# TODO: Replace with actual auth
def get_current_user_id():
    return 1

# Get all calendar entries for a user
@router.get("/calendar/entries")
async def get_calendar_entries(db: Session = Depends(get_db)):
    """
    Returns all entries for the calendar view
    Format: {date: {id, skin_condition, has_image}}
    """
    user_id = get_current_user_id()
    
    entries = db.query(SkinCareEntry).filter(
        SkinCareEntry.user_id == user_id
    ).all()
    
    calendar_data = {}
    for entry in entries:
        calendar_data[str(entry.date)] = {
            "id": entry.id,
            "skin_condition": entry.skin_condition,
            "has_image": entry.image_path is not None
        }
    
    return calendar_data

# Get entry by date
@router.get("/entries/{date_str}")
async def get_entry_by_date(date_str: str, db: Session = Depends(get_db)):
    """
    Get a specific entry by date
    """
    user_id = get_current_user_id()
    
    try:
        entry_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    entry = db.query(SkinCareEntry).filter(
        SkinCareEntry.user_id == user_id,
        SkinCareEntry.date == entry_date
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Get products
    products = db.query(ProductUsage).filter(
        ProductUsage.entry_id == entry.id
    ).all()
    
    print(f"DEBUG: Fetching entry {entry.id} for date {entry_date}")
    print(f"DEBUG: analysis_result = {entry.analysis_result}")  # ← ADDED DEBUG
    print(f"DEBUG: Found {len(products)} products")
    for p in products:
        print(f"  - {p.product_name}")
    
    return {
        "id": entry.id,
        "date": str(entry.date),
        "skin_condition": entry.skin_condition,
        "notes": entry.notes,
        "image_path": entry.image_path,
        "analysis_result": entry.analysis_result,
        "products": [
            {
                "product_name": p.product_name,
                "product_type": p.product_type,
                "time_of_day": p.time_of_day
            }
            for p in products
        ]
    }

# Create new entry
@router.post("/entries")
async def create_entry(entry_data: EntryCreate, db: Session = Depends(get_db)):
    """
    Create a new skincare entry
    """
    user_id = get_current_user_id()
    
    # Check if entry already exists for this date
    existing = db.query(SkinCareEntry).filter(
        SkinCareEntry.user_id == user_id,
        SkinCareEntry.date == entry_data.date
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Entry already exists for this date. Use PUT to update.")
    
    # Create entry
    new_entry = SkinCareEntry(
        user_id=user_id,
        date=entry_data.date,
        skin_condition=entry_data.skin_condition,
        notes=entry_data.notes,
        analysis_result=entry_data.analysis_result  # ← ADDED
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    # Add products
    if entry_data.products:
        print(f"DEBUG: Creating {len(entry_data.products)} products for entry {new_entry.id}")
        for product in entry_data.products:
            print(f"DEBUG:   - product_name={product.product_name}, product_type={product.product_type}, time_of_day={product.time_of_day}")
            product_usage = ProductUsage(
                entry_id=new_entry.id,
                product_name=product.product_name,
                product_type=product.product_type,
                time_of_day=product.time_of_day
            )
            db.add(product_usage)
        db.commit()
        print(f"DEBUG: Products committed to database")
    else:
        print(f"DEBUG: No products in entry_data. entry_data.products={entry_data.products}")
    
    return {
        "id": new_entry.id,
        "date": str(new_entry.date),
        "skin_condition": new_entry.skin_condition,
        "notes": new_entry.notes,
        "analysis_result": new_entry.analysis_result,  # ← ADDED
        "message": "Entry created successfully"
    }

# Update entry
@router.put("/entries/{entry_id}")
async def update_entry(
    entry_id: int,
    entry_data: EntryUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing entry
    """
    user_id = get_current_user_id()
    
    entry = db.query(SkinCareEntry).filter(
        SkinCareEntry.id == entry_id,
        SkinCareEntry.user_id == user_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Update fields
    if entry_data.skin_condition is not None:
        entry.skin_condition = entry_data.skin_condition
    if entry_data.notes is not None:
        entry.notes = entry_data.notes
    if entry_data.analysis_result is not None:  # ← ADDED
        entry.analysis_result = entry_data.analysis_result
    
    # Update products
    if entry_data.products is not None:
        print(f"DEBUG: Updating products for entry {entry_id}")
        print(f"DEBUG: entry_data.products={entry_data.products}")
        # Delete existing products
        deleted_count = db.query(ProductUsage).filter(
            ProductUsage.entry_id == entry_id
        ).delete()
        print(f"DEBUG: Deleted {deleted_count} existing products")
        
        # Add new products
        print(f"DEBUG: Adding {len(entry_data.products)} new products")
        for product in entry_data.products:
            print(f"DEBUG:   - product_name={product.product_name}, product_type={product.product_type}, time_of_day={product.time_of_day}")
            product_usage = ProductUsage(
                entry_id=entry_id,
                product_name=product.product_name,
                product_type=product.product_type,
                time_of_day=product.time_of_day
            )
            db.add(product_usage)
        db.commit()
        print(f"DEBUG: Products committed to database")
    
    db.commit()
    db.refresh(entry)
    
    print(f"DEBUG: Updated entry analysis_result = {entry.analysis_result}")  # ← ADDED DEBUG
    
    return {
        "id": entry.id,
        "message": "Entry updated successfully"
    }

# Delete entry
@router.delete("/entries/{entry_id}")
async def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an entry and all associated data
    """
    user_id = get_current_user_id()
    
    entry = db.query(SkinCareEntry).filter(
        SkinCareEntry.id == entry_id,
        SkinCareEntry.user_id == user_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Delete associated products (cascade should handle this, but explicit is better)
    db.query(ProductUsage).filter(
        ProductUsage.entry_id == entry_id
    ).delete()
    
    # Delete the image file if it exists
    if entry.image_path and os.path.exists(entry.image_path):
        try:
            os.remove(entry.image_path)
            print(f"Deleted image file: {entry.image_path}")
        except Exception as e:
            print(f"Warning: Could not delete image file: {e}")
    
    # Delete the entry
    db.delete(entry)
    db.commit()
    
    return {
        "message": "Entry deleted successfully",
        "deleted_id": entry_id
    }

# Upload image for entry
@router.post("/entries/{entry_id}/upload-image")
async def upload_image(
    entry_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload an image for a skincare entry
    """
    user_id = get_current_user_id()
    
    entry = db.query(SkinCareEntry).filter(
        SkinCareEntry.id == entry_id,
        SkinCareEntry.user_id == user_id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_extension = file.filename.split(".")[-1]
    filename = f"entry_{entry_id}_{datetime.now().timestamp()}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update entry with relative path for frontend
    entry.image_path = f"/uploads/{filename}"
    db.commit()
    
    return {
        "message": "Image uploaded successfully",
        "image_path": entry.image_path
    }

# Serve uploaded images
@router.get("/uploads/{filename}")
async def get_image(filename: str):
    """
    Serve uploaded images
    """
    file_path = os.path.join("uploads", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)