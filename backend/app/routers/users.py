from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database, auth

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=schemas.User)
def get_current_user_info(current_user: database.User = Depends(auth.get_current_user)):
    return current_user


@router.put("/me/avatar", response_model=schemas.User)
def update_user_avatar(
    user_update: schemas.UserUpdate,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if user_update.avatar_url is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avatar URL is required"
        )

    updated_user = crud.update_user_avatar(db, current_user.id, user_update.avatar_url)

    # Log avatar update
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="AVATAR_UPDATED",
        resource_type="user",
        resource_id=str(current_user.id)
    )

    return updated_user

@router.put("/keys")
def update_user_keys(
    public_key: str,
    encrypted_private_key: str,
    db: Session = Depends(database.get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Aktualizace asymetrických klíčů uživatele"""
    updated_user = crud.update_user_keys(db, current_user.id, public_key, encrypted_private_key)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "Keys updated successfully"}


@router.get("/me/stats", response_model=schemas.UserStats)
def get_current_user_stats(
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_user)
):
    """Získá statistiky pro aktuálního uživatele"""
    # Get count of user's own credentials
    credentials = crud.get_credentials(db, current_user.id)
    own_credentials_count = credentials["total"]

    # Get count of credentials shared with the user
    shared_credentials = crud.get_shared_credentials_received(db, current_user.id)
    shared_credentials_count = shared_credentials["total"]

    # Get count of secure notes
    secure_notes = crud.get_secure_notes(db, current_user.id)
    secure_notes_count = secure_notes["total"]

    # Get count of categories
    categories = crud.get_categories(db, current_user.id)
    categories_count = len(categories)

    return schemas.UserStats(
        own_credentials_count=own_credentials_count,
        shared_credentials_count=shared_credentials_count,
        secure_notes_count=secure_notes_count,
        categories_count=categories_count
    )
