from fastapi import FastAPI
from auth import router as auth_router

app = FastAPI(title="Skincare App Backend")

# Include auth routes
app.include_router(auth_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)