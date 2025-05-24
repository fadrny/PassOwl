from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database, auth

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[schemas.PasswordCategory])
def get_categories(
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    categories = crud.get_categories(db, user_id=current_user.id)
    return categories


@router.get("/{category_id}", response_model=schemas.PasswordCategory)
def get_category(
    category_id: int,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    category = crud.get_category(db, category_id=category_id, user_id=current_user.id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=schemas.PasswordCategory)
def create_category(
    category: schemas.PasswordCategoryCreate,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_category = crud.create_category(db=db, category=category, user_id=current_user.id)
    
    # Log category creation
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="CATEGORY_CREATED",
        resource_type="category",
        resource_id=str(db_category.id)
    )
    
    return db_category


@router.put("/{category_id}", response_model=schemas.PasswordCategory)
def update_category(
    category_id: int,
    category: schemas.PasswordCategoryUpdate,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_category = crud.update_category(db, category_id=category_id, user_id=current_user.id, category=category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Log category update
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="CATEGORY_UPDATED",
        resource_type="category",
        resource_id=str(category_id)
    )
    
    return db_category


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: database.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    success = crud.delete_category(db, category_id=category_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Log category deletion
    crud.create_audit_log(
        db=db,
        user_id=current_user.id,
        action="CATEGORY_DELETED",
        resource_type="category",
        resource_id=str(category_id)
    )
    
    return {"message": "Category deleted successfully"}
