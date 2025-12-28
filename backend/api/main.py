from fastapi import FastAPI
from backend.db.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wordle Decoded API")

@app.get("/")
async def root():
    return {"message": "Welcome to the Wordle Decoded API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
