from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import crud, schemas, database, auth

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/salts", response_model=schemas.UserSalts)
def get_user_salts(
    username: str,
    db: Session = Depends(database.get_db)
):
    """Get user's salts for login process - public endpoint"""
    user = crud.get_user_by_username(db, username=username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return schemas.UserSalts(
        login_salt=user.login_salt,
        encryption_salt=user.encryption_salt
    )


@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check if user already exists
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create user
    db_user = crud.create_user(db=db, user=user)
    
    # Log registration
    crud.create_audit_log(
        db=db,
        user_id=db_user.id,
        action="USER_REGISTERED",
        resource_type="user",
        resource_id=str(db_user.id)
    )
    
    return db_user


@router.post("/login", response_model=schemas.Token)
def login_user(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, user_credentials.username, user_credentials.login_password_hash)
    if not user:
        # Log failed login attempt
        crud.create_audit_log(
            db=db,
            user_id=None,
            action="LOGIN_FAILED",
            resource_type="user",
            details={"username": user_credentials.username}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user roles
    user_roles = [role.name for role in user.roles]
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "roles": user_roles}, 
        expires_delta=access_token_expires
    )
    
    # Log successful login
    crud.create_audit_log(
        db=db,
        user_id=user.id,
        action="LOGIN_SUCCESS",
        resource_type="user",
        resource_id=str(user.id)
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
