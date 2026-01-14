import shutil
from typing import Annotated, List

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import os

from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from starlette.responses import JSONResponse

from app.database import get_db
from app.models import Photo, User
from app.schemas import ResponseModel, PhotoResponse
from sqlalchemy import select  # For queries

upload_router = APIRouter(prefix="/uploads")


# Define the upload directory
UPLOAD_DIR = Path("upload")
UPLOAD_DIR.mkdir(exist_ok=True)  # Create if it doesn't exist

import os
import uuid
from datetime import datetime
from pathlib import Path
import hashlib


def generate_unique_filename(original_filename: str = "image.jpg", upload_dir: str = "uploads",
                             use_hash: bool = False) -> str:
    """
    Generate a unique filename for uploads.

    Args:
        original_filename: The base filename (e.g., "photo.jpg").
        upload_dir: Directory to check for existence (for collision detection).
        use_hash: If True, hash the filename + timestamp for obfuscation.

    Returns:
        A unique filename string (e.g., "20260105_143022_uuid-abc123.jpg").
    """
    if not original_filename:
        original_filename = "untitled.jpg"

    # Extract extension
    name, ext = os.path.splitext(original_filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Generate base unique name
    unique_suffix = str(uuid.uuid4())[:8]  # Short UUID for brevity
    base_name = f"{timestamp}_{unique_suffix}"

    if use_hash:
        # Hash for security (e.g., anonymize)
        hash_input = f"{name}_{timestamp}_{unique_suffix}".encode()
        base_name = hashlib.md5(hash_input).hexdigest()[:12]

    filename = f"{base_name}{ext}"
    file_path = Path(upload_dir) / filename

    # Collision check and counter
    counter = 1
    while file_path.exists():
        counter_filename = f"{base_name}_{counter}{ext}"
        file_path = Path(upload_dir) / counter_filename
        filename = counter_filename
        counter += 1

    return filename
@upload_router.post("/user/{user_id}")
async def upload_file(user_id: int, file: Annotated[UploadFile, File(description="A file read as UploadFile")],
                      db: AsyncSession = Depends(get_db)):
    if not file:
        raise HTTPException(status_code=400, detail="No upload file sent")

    # Validate it's an image (optional: check MIME type)
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")



    # Generate unique filename
    filename = generate_unique_filename(file.filename, str(UPLOAD_DIR))
    file_path = UPLOAD_DIR / filename

    # Save the file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"{os.getenv("SERVER_URL")}/static/{filename}"
    # save in data
    # Fetch user
    print(f"user_id: {user_id}")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    photo = Photo(url=image_url, user_id=user.id)
    db.add(photo)
    await db.flush()
    await db.commit()
    await db.refresh(photo)

    #p = PhotoResponse.model_validate(photo) #({ "id": photo.id, "url": photo.url, "user_id": photo.user_id})
    #p=dict(photo._mapping)
    print(f"photo {photo.id} , {photo.url} , {photo.user_id}")

    result = await db.execute(
        select(Photo)
        .options(joinedload(Photo.user))  # Load user relationship
        .where(Photo.id == photo.id)
    )
    photo_with_user = result.scalar_one_or_none()

    if not photo_with_user:
        print("ERROR no photo found")

    # Now validate—user is loaded
    """p = PhotoResponse.model_validate({
        "id": photo_with_user.id,
        "url": photo_with_user.url,
    })"""


    return {
        "status_code": 200,
        "message": "Image uploaded successfully",
        "data": ""

    }

    """return JSONResponse(content={
        "message": "Image uploaded successfully",
        "filename": filename,
        "path": str(file_path),
        "url": image_url,
        
    })"""
    #return {"filename": file.filename}

@upload_router.post("/files")
async def upload_files(files: Annotated[List[UploadFile],  File(description="A file read as UploadFile")]):
    if not files:
        raise HTTPException(status_code=400, detail="No upload files sent")
    print(f"files: {files}")
    return {"filename": [file.filename for file in files]}




