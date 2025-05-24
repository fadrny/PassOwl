from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, credentials, secure_notes, categories, admin
from .database import engine, Base
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="PassOwl API",
    description="Secure password manager with client-side encryption",
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


@app.get("/")
def read_root():
    return {"message": "PassOwl API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
