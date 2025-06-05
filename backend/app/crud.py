from sqlalchemy.orm import Session
from sqlalchemy import and_
from . import database, schemas
from typing import List, Optional
import json

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(database.User).filter(database.User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(database.User).filter(database.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    # Create user role if it doesn't exist
    user_role = db.query(database.Role).filter(database.Role.name == "user").first()
    if not user_role:
        user_role = database.Role(name="user")
        db.add(user_role)
        db.commit()
        db.refresh(user_role)

    db_user = database.User(
        username=user.username,
        login_password_hash=user.login_password_hash,
        login_salt=user.login_salt,
        encryption_salt=user.encryption_salt,
        encrypted_private_key = user.encrypted_private_key,
        public_key=user.public_key
    )
    db_user.roles.append(user_role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_avatar(db: Session, user_id: int, avatar_url: str):
    db_user = db.query(database.User).filter(database.User.id == user_id).first()
    if db_user:
        db_user.avatar_url = avatar_url
        db.commit()
        db.refresh(db_user)
    return db_user


# Role CRUD
def get_role_by_name(db: Session, role_name: str):
    return db.query(database.Role).filter(database.Role.name == role_name).first()


def create_role(db: Session, role_name: str):
    db_role = database.Role(name=role_name)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


# Credential CRUD
def get_credentials(db: Session, user_id: int, skip: int = 0, limit: int = 100, sort_by: str = None, sort_direction: str = None, filter_category: Optional[int] = None):
    query = db.query(database.Credential).filter(
        database.Credential.user_id == user_id
    )

    # Filter by category if specified
    if filter_category is not None:
        query = query.join(database.Credential.categories).filter(
            database.PasswordCategory.id == filter_category
        )

    # Apply sorting if specified
    if sort_by == "created_at":
        if sort_direction == "asc":
            query = query.order_by(database.Credential.updated_at.asc())
        else:
            # Default to descending for date to maintain backward compatibility
            query = query.order_by(database.Credential.updated_at.desc())
    elif sort_by == "title":
        if sort_direction == "desc":
            query = query.order_by(database.Credential.title.desc())
        else:
            # Default to ascending for name to maintain backward compatibility
            query = query.order_by(database.Credential.title.asc())

    return query.offset(skip).limit(limit).all()


def get_credential(db: Session, credential_id: int, user_id: int):
    return db.query(database.Credential).filter(
        and_(database.Credential.id == credential_id, database.Credential.user_id == user_id)
    ).first()


def create_credential(db: Session, credential: schemas.CredentialCreate, user_id: int):
    db_credential = database.Credential(
        user_id=user_id,
        title=credential.title,
        url=credential.url,
        username=credential.username,
        encrypted_data=credential.encrypted_data,
        encryption_iv=credential.encryption_iv
    )

    # Add categories if provided
    if credential.category_ids:
        categories = db.query(database.PasswordCategory).filter(
            and_(
                database.PasswordCategory.id.in_(credential.category_ids),
                database.PasswordCategory.user_id == user_id
            )
        ).all()
        db_credential.categories.extend(categories)

    db.add(db_credential)
    db.commit()
    db.refresh(db_credential)
    return db_credential


def update_credential(db: Session, credential_id: int, user_id: int, credential: schemas.CredentialUpdate):
    db_credential = db.query(database.Credential).filter(
        and_(database.Credential.id == credential_id, database.Credential.user_id == user_id)
    ).first()

    if db_credential:
        if credential.title is not None:
            db_credential.title = credential.title
        if credential.url is not None:
            db_credential.url = credential.url
        if credential.username is not None:
            db_credential.username = credential.username
        if credential.encrypted_data is not None:
            db_credential.encrypted_data = credential.encrypted_data
        if credential.encryption_iv is not None:
            db_credential.encryption_iv = credential.encryption_iv

        # Update categories if provided
        if credential.category_ids is not None:
            categories = db.query(database.PasswordCategory).filter(
                and_(
                    database.PasswordCategory.id.in_(credential.category_ids),
                    database.PasswordCategory.user_id == user_id
                )
            ).all()
            db_credential.categories.clear()
            db_credential.categories.extend(categories)

        db.commit()
        db.refresh(db_credential)

    return db_credential


def delete_credential(db: Session, credential_id: int, user_id: int):
    db_credential = db.query(database.Credential).filter(
        and_(database.Credential.id == credential_id, database.Credential.user_id == user_id)
    ).first()

    if db_credential:
        db.delete(db_credential)
        db.commit()
        return True
    return False


# SecureNote CRUD
def get_secure_notes(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(database.SecureNote).filter(
        database.SecureNote.user_id == user_id
    ).offset(skip).limit(limit).all()


def get_secure_note(db: Session, note_id: int, user_id: int):
    return db.query(database.SecureNote).filter(
        and_(database.SecureNote.id == note_id, database.SecureNote.user_id == user_id)
    ).first()


def create_secure_note(db: Session, note: schemas.SecureNoteCreate, user_id: int):
    db_note = database.SecureNote(
        user_id=user_id,
        encrypted_title=note.encrypted_title,
        encrypted_content=note.encrypted_content,
        encryption_iv=note.encryption_iv
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_secure_note(db: Session, note_id: int, user_id: int, note: schemas.SecureNoteUpdate):
    db_note = db.query(database.SecureNote).filter(
        and_(database.SecureNote.id == note_id, database.SecureNote.user_id == user_id)
    ).first()

    if db_note:
        if note.encrypted_title is not None:
            db_note.encrypted_title = note.encrypted_title
        if note.encrypted_content is not None:
            db_note.encrypted_content = note.encrypted_content
        if note.encryption_iv is not None:
            db_note.encryption_iv = note.encryption_iv

        db.commit()
        db.refresh(db_note)

    return db_note


def delete_secure_note(db: Session, note_id: int, user_id: int):
    db_note = db.query(database.SecureNote).filter(
        and_(database.SecureNote.id == note_id, database.SecureNote.user_id == user_id)
    ).first()

    if db_note:
        db.delete(db_note)
        db.commit()
        return True
    return False


# PasswordCategory CRUD
def get_categories(db: Session, user_id: int):
    return db.query(database.PasswordCategory).filter(
        database.PasswordCategory.user_id == user_id
    ).all()


def get_category(db: Session, category_id: int, user_id: int):
    return db.query(database.PasswordCategory).filter(
        and_(database.PasswordCategory.id == category_id, database.PasswordCategory.user_id == user_id)
    ).first()


def create_category(db: Session, category: schemas.PasswordCategoryCreate, user_id: int):
    db_category = database.PasswordCategory(
        user_id=user_id,
        name=category.name,
        color_hex=category.color_hex
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, user_id: int, category: schemas.PasswordCategoryUpdate):
    db_category = db.query(database.PasswordCategory).filter(
        and_(database.PasswordCategory.id == category_id, database.PasswordCategory.user_id == user_id)
    ).first()

    if db_category:
        if category.name is not None:
            db_category.name = category.name
        if category.color_hex is not None:
            db_category.color_hex = category.color_hex

        db.commit()
        db.refresh(db_category)

    return db_category


def delete_category(db: Session, category_id: int, user_id: int):
    db_category = db.query(database.PasswordCategory).filter(
        and_(database.PasswordCategory.id == category_id, database.PasswordCategory.user_id == user_id)
    ).first()

    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False


# AuditLog CRUD
def create_audit_log(db: Session, user_id: Optional[int], action: str, resource_type: Optional[str] = None, 
                    resource_id: Optional[str] = None, details: Optional[dict] = None):
    details_json = json.dumps(details) if details else None

    db_log = database.AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details_json
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_audit_logs(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None):
    query = db.query(database.AuditLog)
    if user_id:
        query = query.filter(database.AuditLog.user_id == user_id)
    return query.order_by(database.AuditLog.created_at.desc()).offset(skip).limit(limit).all()


# Shared Credentials CRUD
def create_shared_credential(db: Session, shared_credential: schemas.SharedCredentialCreate, owner_user_id: int):
    # Ověř, že vlastník může sdílet toto heslo
    credential = db.query(database.Credential).filter(
        and_(database.Credential.id == shared_credential.credential_id, 
             database.Credential.user_id == owner_user_id)
    ).first()
    
    if not credential:
        return None
    
    # Ověř, že příjemce existuje
    recipient = db.query(database.User).filter(database.User.id == shared_credential.recipient_user_id).first()
    if not recipient:
        return None
    
    db_shared = database.SharedCredential(
        credential_id=shared_credential.credential_id,
        owner_user_id=owner_user_id,
        recipient_user_id=shared_credential.recipient_user_id,
        encrypted_sharing_key=shared_credential.encrypted_sharing_key,
        encrypted_shared_data=shared_credential.encrypted_shared_data,
        sharing_iv=shared_credential.sharing_iv
    )
    
    db.add(db_shared)
    db.commit()
    db.refresh(db_shared)
    return db_shared

def get_shared_credentials_received(db: Session, user_id: int):
    return db.query(database.SharedCredential).join(
        database.Credential, database.SharedCredential.credential_id == database.Credential.id
    ).join(
        database.User, database.SharedCredential.owner_user_id == database.User.id
    ).filter(
        database.SharedCredential.recipient_user_id == user_id
    ).all()

def get_shared_credentials_owned(db: Session, user_id: int):
    return db.query(database.SharedCredential).join(
        database.Credential, database.SharedCredential.credential_id == database.Credential.id
    ).filter(
        database.SharedCredential.owner_user_id == user_id
    ).all()

def delete_shared_credential(db: Session, shared_credential_id: int, user_id: int):
    # User může smazat pouze své vlastní sdílení (jako owner)
    db_shared = db.query(database.SharedCredential).filter(
        and_(database.SharedCredential.id == shared_credential_id,
             database.SharedCredential.owner_user_id == user_id)
    ).first()
    
    if db_shared:
        db.delete(db_shared)
        db.commit()
        return True
    return False

def get_user_public_key(db: Session, user_id: int):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if user and user.public_key:
        return {"id": user.id, "username": user.username, "public_key": user.public_key}
    return None

def search_users_by_username(db: Session, username_query: str, current_user_id: int, limit: int = 10):
    return db.query(database.User).filter(
        and_(
            database.User.username.ilike(f"%{username_query}%"),
            database.User.id != current_user_id  # Nevracet současného uživatele
        )
    ).limit(limit).all()

# Currently not used in the codebase, but can be used for updating user keys in future
def update_user_keys(db: Session, user_id: int, public_key: str, encrypted_private_key: str):
    db_user = db.query(database.User).filter(database.User.id == user_id).first()
    if db_user:
        db_user.public_key = public_key
        db_user.encrypted_private_key = encrypted_private_key
        db.commit()
        db.refresh(db_user)
    return db_user
