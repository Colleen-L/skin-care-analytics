"""
Inspect the actual data structure of skincare_entries to see how products are stored
"""
from db_conn import SessionLocal
from sqlalchemy import inspect
import json

db = SessionLocal()

print("=" * 70)
print("INSPECTING SKINCARE_ENTRIES TABLE STRUCTURE")
print("=" * 70)

# Get table structure
inspector = inspect(db.bind)
columns = inspector.get_columns('skincare_entries')

print("\n📋 COLUMNS IN skincare_entries:")
print("-" * 70)
for col in columns:
    print(f"  {col['name']:20} | Type: {col['type']} | Nullable: {col['nullable']}")

# Get a sample entry to see actual data
from models import SkinCareEntry
sample = db.query(SkinCareEntry).first()

if sample:
    print("\n" + "=" * 70)
    print("SAMPLE ENTRY DATA:")
    print("=" * 70)
    
    print(f"\nEntry ID: {sample.id}")
    print(f"Date: {sample.date}")
    print(f"User ID: {sample.user_id}")
    print(f"Skin Condition: {sample.skin_condition}")
    print(f"Notes: {sample.notes}")
    print(f"Image Path: {sample.image_path}")
    print(f"Analysis Result: {sample.analysis_result}")
    print(f"Created At: {sample.created_at}")
    print(f"Updated At: {sample.updated_at}")
    
    # Check if there are any other attributes
    print("\n📦 ALL ATTRIBUTES:")
    for attr in dir(sample):
        if not attr.startswith('_') and not callable(getattr(sample, attr)):
            value = getattr(sample, attr)
            if value is not None and attr not in ['metadata', 'registry']:
                print(f"  {attr}: {value}")
    
    # Check the relationships
    print("\n🔗 RELATIONSHIPS:")
    if hasattr(sample, 'products'):
        products = sample.products
        print(f"  Products (via relationship): {len(products) if products else 0} items")
        if products:
            for p in products:
                print(f"    - {p.product_name} ({p.product_type})")
    
    if hasattr(sample, 'user'):
        print(f"  User: {sample.user.username if sample.user else 'None'}")

else:
    print("\n❌ No entries found in database")

# Check product_usage table
from models import ProductUsage
products = db.query(ProductUsage).all()
print("\n" + "=" * 70)
print(f"CURRENT PRODUCT_USAGE RECORDS: {len(products)}")
print("=" * 70)
if products:
    for p in products:
        print(f"  Entry {p.entry_id}: {p.product_name} ({p.product_type}, {p.time_of_day})")
else:
    print("  No products found in product_usage table")

# Check skin_analyses table  
from models import SkinAnalysis
analyses = db.query(SkinAnalysis).all()
print("\n" + "=" * 70)
print(f"CURRENT SKIN_ANALYSES RECORDS: {len(analyses)}")
print("=" * 70)
if analyses:
    for a in analyses[:5]:  # Show first 5
        print(f"  ID {a.id} (User {a.user_id}): {a.created_at}")
        if a.result:
            preview = a.result[:100]
            print(f"    Result: {preview}...")
else:
    print("  No analyses found in skin_analyses table")

db.close()

print("\n" + "=" * 70)
print("✅ INSPECTION COMPLETE")
print("=" * 70)
print("\n💡 Based on this output, I can help you:")
print("   1. Migrate products if they're stored in the entry")
print("   2. Create proper product_usage records")
print("   3. Link skin_analyses to entries")