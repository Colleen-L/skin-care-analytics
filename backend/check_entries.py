"""
Detailed diagnostic for skincare entries
"""
from db_conn import SessionLocal
from models import SkinCareEntry, SkinAnalysis, User
from sqlalchemy import desc, func

db = SessionLocal()

print("=" * 70)
print("DETAILED DATABASE DIAGNOSTIC")
print("=" * 70)

# Count entries
entry_count = db.query(func.count(SkinCareEntry.id)).scalar()
print(f"\n📊 Total skincare entries: {entry_count}")

if entry_count == 0:
    print("\n⚠️  NO SKINCARE ENTRIES FOUND!")
    print("   This means entries are not being created when you save.")
    print("   The AI analysis is working, but entries aren't being saved.")
else:
    # Show all entries with details
    entries = db.query(SkinCareEntry).order_by(desc(SkinCareEntry.date)).all()
    
    print(f"\n📅 ALL SKINCARE ENTRIES ({len(entries)}):")
    print("-" * 70)
    
    for entry in entries:
        print(f"\n Entry ID: {entry.id}")
        print(f" Date: {entry.date}")
        print(f" User ID: {entry.user_id}")
        print(f" Skin Condition: {entry.skin_condition or 'NOT SET'}")
        print(f" Notes: {entry.notes or 'EMPTY'}")
        print(f" Image Path: {entry.image_path or 'NO IMAGE'}")
        print(f" Analysis Result: {entry.analysis_result or 'NO ANALYSIS'}")
        print(f" Created: {entry.created_at}")
        print(f" Updated: {entry.updated_at}")
        
        # Check products
        from models import ProductUsage
        products = db.query(ProductUsage).filter(ProductUsage.entry_id == entry.id).all()
        if products:
            print(f" Products ({len(products)}):")
            for p in products:
                print(f"   - {p.product_name}")
        else:
            print(f" Products: NONE")
        
        print("-" * 70)

# AI Analyses summary
analysis_count = db.query(func.count(SkinAnalysis.id)).scalar()
print(f"\n🤖 Total AI analyses: {analysis_count}")

# Check if entries have analysis
entries_with_analysis = db.query(SkinCareEntry).filter(
    SkinCareEntry.analysis_result.isnot(None)
).count()
print(f"📊 Entries with AI analysis: {entries_with_analysis}/{entry_count}")

# Recent AI analyses
print(f"\n🤖 MOST RECENT AI ANALYSES (from skin_analyses table):")
print("-" * 70)
recent = db.query(SkinAnalysis).order_by(desc(SkinAnalysis.created_at)).limit(3).all()
for a in recent:
    print(f"\n Analysis ID: {a.id}")
    print(f" User: {a.user_id}")
    print(f" Time: {a.created_at}")
    if a.result:
        import json
        try:
            data = json.loads(a.result)
            if 'result' in data:
                skin_data = data['result']
                concerns = []
                if skin_data.get('acne', {}).get('value') == 1:
                    concerns.append('Acne')
                if skin_data.get('mole', {}).get('value') == 1:
                    concerns.append('Moles')
                if skin_data.get('eye_pouch', {}).get('value') == 1:
                    concerns.append('Eye Pouches')
                print(f" Detected: {', '.join(concerns) if concerns else 'Nothing major'}")
        except:
            print(f" Result: {a.result[:100]}...")
    print("-" * 70)

db.close()
print("\n✅ Diagnostic complete!")
print("\n💡 NEXT STEPS:")
if entry_count == 0:
    print("   1. Make sure you click 'Save Entry' after taking a photo")
    print("   2. Check browser console for errors")
    print("   3. Check backend logs when clicking Save")
elif entries_with_analysis == 0:
    print("   1. Update face_scan.py with the latest version")
    print("   2. Take a new photo")
    print("   3. Run this script again to verify")
else:
    print("   Everything looks good! ✅")