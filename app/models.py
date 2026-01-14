import datetime
from typing import List

from sqlalchemy import Table, Column, ForeignKey, String, Integer, DateTime, func, Boolean, UniqueConstraint, Text
from sqlalchemy.orm import relationship, Mapped
from app.database import Base



class RolePermission(Base):
    __tablename__ = 'role_permissions'

    role_id = Column(Integer, ForeignKey('roles.id'), primary_key=True, nullable=False, index=True)
    permission_id = Column(Integer, ForeignKey('permissions.id'), primary_key=True, nullable=False, index=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())  # Extra field example
    notes = Column(String(500))  # e.g., "Temporary access"

    # Composite unique constraint
    __table_args__ = (UniqueConstraint('role_id', 'permission_id'),)

    # Many-to-One: Back to parents (now matching back_populates)
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")

class Photo(Base):
    __tablename__ = 'photos'
    id = Column(Integer, primary_key=True)
    url = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'))  # Explicit FK with ondelete for cleanup

    # Many-to-One: Photo belongs to one User
    user = relationship("User", back_populates="photos")


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    name = Column(String(120))
    is_active = Column(Boolean, default=True)
    # Foreign key fix: 'roles.id' (plural table name)
    role_id = Column(Integer, ForeignKey('roles.id'))  # Nullable if no role required

    # Relationship: One Role per User
    role = relationship("Role", back_populates="users")

    # One-to-Many: User has many Photos
    photos = relationship("Photo", back_populates="user")

    # One-to-Many: User has many AuditLogs
    audit_logs = relationship("AuditLog", back_populates="user")


class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    #users = relationship("User", back_populates="roles")
    # Relationships
    users = relationship("User", back_populates="role")  # Many users per role

    # Uncommented: Many permissions per role (via junction)
    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")

class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(Integer, primary_key=True)
    name = Column(String(80), unique=True)
    resource = Column(String(80))
    description = Column(String(255))
    #
    roles = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")

    # New FK to Action
    action_id = Column(Integer, ForeignKey('actions.id'), nullable=False)
    action = relationship("Action", back_populates="permissions")


# New Action Model
class Action(Base):
    __tablename__ = 'actions'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # e.g., "create", "read"
    #description = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One-to-Many: Actions can be in many permissions
    permissions = relationship("Permission", back_populates="action")

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id= Column(Integer, primary_key=True)
    action = Column(String(255))
    ip = Column(String(50))
    user_agent = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    #user_id = Column(Integer, ForeignKey('users.id'))
    #user = relationship("users")
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)  # Added nullable=False for integrity

    # Many-to-One: AuditLog belongs to one User (fixed: "User" class name)
    user = relationship("User", back_populates="audit_logs")


#
# Source - https://stackoverflow.com/a
# Posted by Miguel Calles, modified by community. See post 'Timeline' for change history
# Retrieved 2026-01-04, License - CC BY-SA 4.0
"""
class ItemDetail(Base):
    __tablename__ = 'ItemDetail'
    id = Column(Integer, primary_key=True, index=True)
    itemId = Column(Integer, ForeignKey('Item.id'))
    detailId = Column(Integer, ForeignKey('Detail.id'))
    endDate = Column(DateTime, server_default=func.now())

class Item(Base):
    __tablename__ = 'Item'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    #description = Column(Text)
    details = relationship('Detail', secondary=ItemDetail.__table__, backref='Item')

class Detail(Base):
    __tablename__ = 'Detail'
    id = Column(Integer, primary_key=True)
    name = Column(String(50))
    #value = Column(String)
    items = relationship('Item', secondary=ItemDetail.__table__, backref='Detail')"""

