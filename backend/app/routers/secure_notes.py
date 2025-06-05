from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database, auth

router = APIRouter(prefix="/secure-notes", tags=["secure-notes"])


@router.get("/", response_model=schemas.SecureNoteListResponse)
def get_secure_notes(
    skip: int = 0,
    limit: int = 100,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    result = crud.get_secure_notes(db, user_id=current_user.id, skip=skip, limit=limit)
    return schemas.SecureNoteListResponse(items=result["items"], total=result["total"])


@router.get("/{note_id}", response_model=schemas.SecureNote)
def get_secure_note(
    note_id: int,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    note = crud.get_secure_note(db, note_id=note_id, user_id=current_user.id)
    if note is None:
        raise HTTPException(status_code=404, detail="Secure note not found")
    return note


@router.post("/", response_model=schemas.SecureNote)
def create_secure_note(
    note: schemas.SecureNoteCreate,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_note = crud.create_secure_note(db=db, note=note, user_id=current_user.id)

    # Log note creation
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="NOTE_CREATED",
        resource_type="secure_note",
        resource_id=str(db_note.id)
    )

    return db_note


@router.put("/{note_id}", response_model=schemas.SecureNote)
def update_secure_note(
    note_id: int,
    note: schemas.SecureNoteUpdate,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_note = crud.update_secure_note(db, note_id=note_id, user_id=current_user.id, note=note)
    if db_note is None:
        raise HTTPException(status_code=404, detail="Secure note not found")

    # Log note update
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="NOTE_UPDATED",
        resource_type="secure_note",
        resource_id=str(note_id)
    )

    return db_note


@router.delete("/{note_id}")
def delete_secure_note(
    note_id: int,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    success = crud.delete_secure_note(db, note_id=note_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Secure note not found")

    # Log note deletion
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="NOTE_DELETED",
        resource_type="secure_note",
        resource_id=str(note_id)
    )

    return {"message": "Secure note deleted successfully"}
