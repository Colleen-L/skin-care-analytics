from models import Base
from db_conn import engine

# create all tables
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")