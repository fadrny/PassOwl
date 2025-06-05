from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Table, Boolean, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/passowl")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Should handle scale-to-zero
    connect_args={
        "connect_timeout": 30,
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association table for user-role many-to-many relationship
user_roles = Table('user_roles', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete='CASCADE'), primary_key=True)
)

# Association table for credential-category many-to-many relationship
credential_category_links = Table('credential_category_links', Base.metadata,
    Column('credential_id', Integer, ForeignKey('credentials.id', ondelete='CASCADE'), primary_key=True),
    Column('category_id', Integer, ForeignKey('password_categories.id', ondelete='CASCADE'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    login_password_hash = Column(String, nullable=False)
    login_salt = Column(String, nullable=False)
    encryption_salt = Column(String, nullable=False)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    public_key = Column(Text)
    encrypted_private_key = Column(Text)

    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    credentials = relationship("Credential", back_populates="owner", cascade="all, delete-orphan")
    secure_notes = relationship("SecureNote", back_populates="owner", cascade="all, delete-orphan")
    categories = relationship("PasswordCategory", back_populates="owner", cascade="all, delete-orphan")
    shared_credentials_owned = relationship("SharedCredential", foreign_keys="SharedCredential.owner_user_id", back_populates="owner")
    shared_credentials_received = relationship("SharedCredential", foreign_keys="SharedCredential.recipient_user_id", back_populates="recipient")


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")


class Credential(Base):
    __tablename__ = "credentials"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(Text, nullable=False)
    url = Column(Text, nullable=True)
    username = Column(Text, nullable=False)
    encrypted_data = Column(Text, nullable=False)
    encryption_iv = Column(String(24), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="credentials")
    categories = relationship("PasswordCategory", secondary=credential_category_links, back_populates="credentials")
    shared_with = relationship("SharedCredential", back_populates="credential")


class SecureNote(Base):
    __tablename__ = "secure_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    encrypted_title = Column(Text, nullable=False)
    encrypted_content = Column(Text, nullable=False)
    encryption_iv = Column(String(24), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="secure_notes")


class PasswordCategory(Base):
    __tablename__ = "password_categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    color_hex = Column(String(7), nullable=True)  # Format: #RRGGBB
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="categories")
    credentials = relationship("Credential", secondary=credential_category_links, back_populates="categories")

    __table_args__ = (UniqueConstraint('user_id', 'name', name='_user_category_name_uc'),)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)  # JSON string for additional context
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SharedCredential(Base):
    __tablename__ = "shared_credentials"

    id = Column(Integer, primary_key=True, index=True)
    credential_id = Column(Integer, ForeignKey("credentials.id", ondelete="CASCADE"), nullable=False)
    owner_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    encrypted_sharing_key = Column(Text, nullable=False)
    encrypted_shared_data = Column(Text, nullable=False)
    sharing_iv = Column(String(24), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    credential = relationship("Credential", back_populates="shared_with")
    owner = relationship("User", foreign_keys=[owner_user_id], back_populates="shared_credentials_owned")
    recipient = relationship("User", foreign_keys=[recipient_user_id], back_populates="shared_credentials_received")

    __table_args__ = (
        UniqueConstraint('credential_id', 'recipient_user_id', name='unique_credential_recipient'),
    )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
