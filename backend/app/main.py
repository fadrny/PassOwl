from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, credentials, secure_notes, categories, admin, sharing
from .database import engine, Base
import os
from dotenv import load_dotenv

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PassOwl API",
    description="Backend pro aplikaci PassOwl",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(credentials.router)
app.include_router(secure_notes.router)
app.include_router(categories.router)
app.include_router(admin.router)
app.include_router(sharing.router)


@app.get("/")
def read_root():
    return {"message": "PassOwl API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
