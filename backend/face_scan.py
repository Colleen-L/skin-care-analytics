from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from db_conn import SessionLocal
from models import SkinAnalysis, SkinCareEntry
import os
import requests
import json
from datetime import datetime

# Create a router with prefix
router = APIRouter(prefix="/skincare/entries", tags=["skincare"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

AILABTOOLS_API_KEY = os.getenv("AILABTOOLS_API_KEY")
API_URL = "https://www.ailabapi.com/api/portrait/analysis/skin-analysis"

def analyze_skin_image(file_bytes, filename, content_type):
    """
    Sends image bytes to AILabTools API and returns JSON result.
    """
    if not AILABTOOLS_API_KEY:
        raise Exception("AILABTOOLS_API_KEY environment variable not set")
    
    response = requests.post(
        API_URL,
        headers={"ailabapi-api-key": AILABTOOLS_API_KEY},
        files={"image": (filename, file_bytes, content_type)},
        timeout=60  # 60 second timeout
    )
    
    if response.status_code != 200:
        raise Exception(f"AILabTools API error: {response.status_code} - {response.text}")
    
    return response.json()

def format_analysis_result(api_response):
    """
    Format the AI API response into a user-friendly string
    """
    try:
        # The actual results are in the 'result' key
        if isinstance(api_response, dict) and 'result' in api_response:
            data = api_response['result']
            
            summary_parts = []
            
            # Skin type
            if 'skin_type' in data:
                skin_types = ['Oily', 'Dry', 'Normal', 'Combination']
                skin_type_value = data['skin_type'].get('skin_type', 2)
                if 0 <= skin_type_value < len(skin_types):
                    summary_parts.append(f"Skin Type: {skin_types[skin_type_value]}")
            
            # Check for skin concerns (value = 1 means present)
            concerns = []
            
            if data.get('acne', {}).get('value') == 1:
                concerns.append('Acne')
            
            if data.get('eye_pouch', {}).get('value') == 1:
                concerns.append('Eye Pouches')
            
            if data.get('dark_circle', {}).get('value') == 1:
                concerns.append('Dark Circles')
            
            if data.get('skin_spot', {}).get('value') == 1:
                concerns.append('Skin Spots')
            
            if data.get('mole', {}).get('value') == 1:
                concerns.append('Moles')
            
            if data.get('blackhead', {}).get('value') == 1:
                concerns.append('Blackheads')
            
            if data.get('forehead_wrinkle', {}).get('value') == 1:
                concerns.append('Forehead Wrinkles')
            
            if data.get('crows_feet', {}).get('value') == 1:
                concerns.append("Crow's Feet")
            
            if data.get('nasolabial_fold', {}).get('value') == 1:
                concerns.append('Nasolabial Folds')
            
            if concerns:
                summary_parts.append(f"Detected: {', '.join(concerns)}")
            else:
                summary_parts.append("No major concerns detected")
            
            # Pore information
            pore_areas = []
            if data.get('pores_forehead', {}).get('value') == 1:
                pore_areas.append('forehead')
            if data.get('pores_left_cheek', {}).get('value') == 1:
                pore_areas.append('left cheek')
            if data.get('pores_right_cheek', {}).get('value') == 1:
                pore_areas.append('right cheek')
            if data.get('pores_jaw', {}).get('value') == 1:
                pore_areas.append('jaw')
            
            if pore_areas:
                summary_parts.append(f"Visible pores on: {', '.join(pore_areas)}")
            
            if summary_parts:
                return " | ".join(summary_parts)
        
        return "Analysis completed successfully"
        
    except Exception as e:
        print(f"Error formatting result: {e}")
        return "Analysis completed - see raw data for details"

# AI Analysis endpoint that matches frontend
@router.post("/ai-analysis")
async def ai_analysis(
    file: UploadFile = File(...),
    date: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyze skin from uploaded image using AILabTools API.
    This endpoint matches the frontend call: /skincare/entries/ai-analysis
    """
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        print(f"Analyzing image: {file.filename}, size: {len(file_bytes)} bytes")
        
        # Call AI API
        api_result = analyze_skin_image(file_bytes, file.filename, file.content_type)
        
        print(f"AI API response: {api_result}")
        
        # Format the result for display
        formatted_result = format_analysis_result(api_result)
        
        print(f"Formatted result: {formatted_result}")
        
        # Update the skincare entry if a date was provided
        if date:
            try:
                from datetime import datetime
                entry_date = datetime.strptime(date, "%Y-%m-%d").date()
                
                # Find the entry for this date
                from models import SkinCareEntry
                entry = db.query(SkinCareEntry).filter(
                    SkinCareEntry.user_id == 1,  # TODO: Get from auth
                    SkinCareEntry.date == entry_date
                ).first()
                
                if entry:
                    entry.analysis_result = formatted_result
                    db.commit()
                    print(f"Updated skincare entry {entry.id} with analysis result")
                else:
                    print(f"No entry found for date {date}, creating one...")
                    # Create a new entry with just the analysis
                    new_entry = SkinCareEntry(
                        user_id=1,  # TODO: Get from auth
                        date=entry_date,
                        analysis_result=formatted_result
                    )
                    db.add(new_entry)
                    db.commit()
                    db.refresh(new_entry)
                    print(f"Created new entry {new_entry.id} with analysis")
                    
            except Exception as e:
                print(f"Warning: Could not update skincare entry: {e}")
        
        # Try to store raw data in skin_analyses table (optional)
        analysis_id = None
        try:
            analysis = SkinAnalysis(
                user_id=1,  # TODO: Get from authenticated user
                result=json.dumps(api_result)
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            analysis_id = analysis.id
        except Exception as db_error:
            print(f"Warning: Could not save to skin_analyses table: {db_error}")
            print("Continuing without skin_analyses storage...")
        
        return {
            "id": analysis_id,
            "result": formatted_result,  # User-friendly formatted text
            "raw_data": api_result,  # Full API response
            "message": "Skin analysis completed successfully"
        }
        
    except requests.Timeout:
        raise HTTPException(
            status_code=504, 
            detail="AI analysis timed out after 60 seconds. Please try again with a smaller image."
        )
    except requests.RequestException as e:
        print(f"AI API request error: {str(e)}")
        raise HTTPException(
            status_code=502, 
            detail=f"AI API connection failed: {str(e)}"
        )
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )

# Legacy endpoint for backward compatibility
@router.post("/analyze_skin/")
async def analyze_skin_legacy(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)  
):
    """
    Legacy endpoint - redirects to new ai-analysis endpoint
    """
    return await ai_analysis(file=file, db=db)