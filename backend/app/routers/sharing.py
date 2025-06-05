from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from .. import crud, schemas, auth, database
from ..database import get_db

router = APIRouter(
    prefix="/api/sharing",
    tags=["sharing"]
)

@router.post("/share", response_model=schemas.SharedCredentialResponse)
def share_credential(
    shared_credential: schemas.SharedCredentialCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Sdílení hesla s jiným uživatelem"""
    # Check if credential already exists in crud.py
    db_shared = crud.create_shared_credential(db, shared_credential, current_user.id)
    if not db_shared:
        # Check if it's because the credential is already shared
        existing_share = db.query(database.SharedCredential).filter(
            and_(
                database.SharedCredential.credential_id == shared_credential.credential_id,
                database.SharedCredential.owner_user_id == current_user.id,
                database.SharedCredential.recipient_user_id == shared_credential.recipient_user_id
            )
        ).first()

        if existing_share:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This credential is already shared with this user"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot share this credential"
            )

    # Připoj dodatečné informace pro response
    credential = crud.get_credential(db, db_shared.credential_id, current_user.id)
    owner = crud.get_user(db, db_shared.owner_user_id)

    response_data = schemas.SharedCredentialResponse(
        id=db_shared.id,
        credential_id=db_shared.credential_id,
        owner_user_id=db_shared.owner_user_id,
        recipient_user_id=db_shared.recipient_user_id,
        encrypted_sharing_key=db_shared.encrypted_sharing_key,
        encrypted_shared_data=db_shared.encrypted_shared_data,
        sharing_iv=db_shared.sharing_iv,
        created_at=db_shared.created_at,
        credential_title=credential.title if credential else "",
        owner_username=owner.username if owner else ""
    )

    return response_data

@router.get("/received", response_model=schemas.SharedCredentialListResponse)
def get_received_shared_credentials(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Získání hesel sdílených s aktuálním uživatelem"""
    result = crud.get_shared_credentials_received(db, current_user.id, skip=skip, limit=limit)

    response_list = []
    for shared in result["items"]:
        credential = crud.get_credential(db, shared.credential_id, shared.owner_user_id)
        owner = crud.get_user(db, shared.owner_user_id)

        response_list.append(schemas.SharedCredentialResponse(
            id=shared.id,
            credential_id=shared.credential_id,
            owner_user_id=shared.owner_user_id,
            recipient_user_id=shared.recipient_user_id,
            encrypted_sharing_key=shared.encrypted_sharing_key,
            encrypted_shared_data=shared.encrypted_shared_data,
            sharing_iv=shared.sharing_iv,
            created_at=shared.created_at,
            credential_title=credential.title if credential else "",
            owner_username=owner.username if owner else ""
        ))

    return schemas.SharedCredentialListResponse(items=response_list, total=result["total"])

@router.get("/owned", response_model=List[schemas.SharedCredentialResponse])
def get_owned_shared_credentials(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Získání hesel, která aktuální uživatel sdílí"""
    shared_credentials = crud.get_shared_credentials_owned(db, current_user.id)

    response_list = []
    for shared in shared_credentials:
        credential = crud.get_credential(db, shared.credential_id, current_user.id)
        recipient = crud.get_user(db, shared.recipient_user_id)

        response_list.append(schemas.SharedCredentialResponse(
            id=shared.id,
            credential_id=shared.credential_id,
            owner_user_id=shared.owner_user_id,
            recipient_user_id=shared.recipient_user_id,
            encrypted_sharing_key=shared.encrypted_sharing_key,
            encrypted_shared_data=shared.encrypted_shared_data,
            sharing_iv=shared.sharing_iv,
            created_at=shared.created_at,
            credential_title=credential.title if credential else "",
            owner_username=recipient.username if recipient else ""
        ))

    return response_list

@router.delete("/{shared_credential_id}")
def delete_shared_credential(
    shared_credential_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Zrušení sdílení hesla"""
    success = crud.delete_shared_credential(db, shared_credential_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared credential not found"
        )
    return {"message": "Shared credential deleted successfully"}

@router.get("/users/{user_id}/public-key", response_model=schemas.UserPublicKey)
def get_user_public_key(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Získání veřejného klíče uživatele"""
    user_key = crud.get_user_public_key(db, user_id)
    if not user_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User public key not found"
        )
    return user_key

@router.get("/users/search")
def search_users(
    q: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Vyhledání uživatelů pro sdílení"""
    if len(q) < 2:
        return []

    users = crud.search_users_by_username(db, q, current_user.id)
    return [{"id": user.id, "username": user.username} for user in users]


@router.get("/credential/{credential_id}/users", response_model=List[schemas.SharedUserResponse])
def get_credential_shared_users(
    credential_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Získání seznamu uživatelů, se kterými je sdíleno dané heslo"""
    users = crud.get_shared_credential_users(db, credential_id, current_user.id)
    if users is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found or you don't have permission to access it"
        )
    return users


@router.delete("/credential/{credential_id}/user/{user_id}")
def delete_credential_sharing(
    credential_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Zrušení sdílení hesla s konkrétním uživatelem"""
    success = crud.delete_shared_credential_by_ids(db, credential_id, user_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared credential not found or you don't have permission to delete it"
        )
    return {"message": "Shared credential deleted successfully"}


@router.put("/credential/{credential_id}/user/{user_id}", response_model=schemas.SharedCredentialResponse)
def update_credential_sharing(
    credential_id: int,
    user_id: int,
    shared_credential: schemas.SharedCredentialUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    """Aktualizace sdíleného hesla"""
    updated_shared = crud.update_shared_credential(db, credential_id, user_id, current_user.id, shared_credential)
    if not updated_shared:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared credential not found or you don't have permission to update it"
        )

    # Připoj dodatečné informace pro response
    credential = crud.get_credential(db, updated_shared.credential_id, current_user.id)
    recipient = crud.get_user(db, updated_shared.recipient_user_id)

    response_data = schemas.SharedCredentialResponse(
        id=updated_shared.id,
        credential_id=updated_shared.credential_id,
        owner_user_id=updated_shared.owner_user_id,
        recipient_user_id=updated_shared.recipient_user_id,
        encrypted_sharing_key=updated_shared.encrypted_sharing_key,
        encrypted_shared_data=updated_shared.encrypted_shared_data,
        sharing_iv=updated_shared.sharing_iv,
        created_at=updated_shared.created_at,
        credential_title=credential.title if credential else "",
        owner_username=recipient.username if recipient else ""
    )

    return response_data
