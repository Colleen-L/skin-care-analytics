from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from face_scan import router as face_scan_router
from skincare_router import router as skincare_router

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(face_scan_router)
app.include_router(skincare_router)

@app.get("/")
def read_root():
    return {"message": "API is running"}