from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, database, auth

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=List[schemas.User])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: database.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    users = crud.get_users(db, skip=skip, limit=limit)
    
    # Log admin action
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="ADMIN_VIEW_USERS",
        resource_type="user"
    )
    
    return users


@router.get("/audit-logs", response_model=List[schemas.AuditLog])
def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    current_user: database.User = Depends(auth.require_admin),
    db: Session = Depends(database.get_db)
):
    logs = crud.get_audit_logs(db, skip=skip, limit=limit, user_id=user_id)
    
    # Log admin action
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="ADMIN_VIEW_AUDIT_LOGS",
        resource_type="audit_log"
    )
    
    return logs



