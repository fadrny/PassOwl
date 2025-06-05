from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, database, auth

router = APIRouter(prefix="/credentials", tags=["credentials"])


@router.get("/", response_model=schemas.CredentialListResponse)
def get_credentials(
    skip: int = 0,
    limit: int = 100,
    sort_by: str = None,
    sort_direction: str = None,
    filter_category: Optional[int] = None,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    result = crud.get_credentials(db, user_id=current_user.id, skip=skip, limit=limit, sort_by=sort_by, sort_direction=sort_direction, filter_category=filter_category)
    return schemas.CredentialListResponse(items=result["items"], total=result["total"])


@router.get("/{credential_id}", response_model=schemas.Credential)
def get_credential(
    credential_id: int,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    credential = crud.get_credential(db, credential_id=credential_id, user_id=current_user.id)
    if credential is None:
        raise HTTPException(status_code=404, detail="Credential not found")
    return credential


@router.post("/", response_model=schemas.Credential)
def create_credential(
    credential: schemas.CredentialCreate,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_credential = crud.create_credential(db=db, credential=credential, user_id=current_user.id)

    # Log credential creation
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="CREDENTIAL_CREATED",
        resource_type="credential",
        resource_id=str(db_credential.id)
    )

    return db_credential


@router.put("/{credential_id}", response_model=schemas.Credential)
def update_credential(
    credential_id: int,
    credential: schemas.CredentialUpdate,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_credential = crud.update_credential(
        db=db, 
        credential_id=credential_id, 
        user_id=current_user.id, 
        credential=credential
    )
    if db_credential is None:
        raise HTTPException(status_code=404, detail="Credential not found")

    # Log credential update
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="CREDENTIAL_UPDATED",
        resource_type="credential",
        resource_id=str(credential_id)
    )

    return db_credential


@router.delete("/{credential_id}")
def delete_credential(
    credential_id: int,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    success = crud.delete_credential(db=db, credential_id=credential_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Credential not found")

    # Log credential deletion
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="CREDENTIAL_DELETED",
        resource_type="credential",
        resource_id=str(credential_id)
    )

    return {"message": "Credential deleted successfully"}
