import shutil
from typing import Annotated, List

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pathlib import Path
import os

from fastapi.params import Depends
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from starlette.responses import JSONResponse

from app.common.help import orm_to_dict
from app.database import get_db
from app.models import Photo, User
from app.schemas import ResponseModel, PhotoResponse, UserPhotosResponse, PhotoOut
from sqlalchemy import select  # For queries

photos_router = APIRouter(prefix="/photos")

@photos_router.get("/all/user/{user_id}")
async def get_photos_by_user_id(user_id: int, db: AsyncSession = Depends(get_db)):
      #stmt = select(User).options(selectinload(User.photos)).where(User.id == user_id)
      #result = await db.execute(stmt)
      #user = result.scalar_one_or_none()
      #if not user:
          #raise HTTPException(status_code=400, detail="User not found")

      result_photos = await db.execute(select(Photo).where(Photo.user_id == user_id))
      photos = result_photos.scalars().all()

      if not photos:
          raise HTTPException(status_code=400, detail="Photos not found")

      #l = [PhotoResponse(**row._asdict()) for row in photos] #// by result.fetchall()
      l = [PhotoOut.model_validate(orm_to_dict(row)) for row in photos]

      """u = UserPhotosResponse.model_validate({
          "user_id": user.id,
          "name": user.name,
          "photos": user.photos  # List of Photo → Auto-serialized
      })"""

      photos_response = []

      """for photo in user.:

          if photo and hasattr(photos, 'id') and photo.id is not None:
              try:
                  print(f"permission: {photo.id}")
                  p = PhotoResponse.model_validate({
                      "id": photo.id,
                      "url": photo.url

                  })
                  photos_response.append(p)
                  print(f"p: {p}")
              except ValidationError as e:
                  print(f"error: {e}")

      print(photos_response)"""






      return {
          "status_code": 200,
          "message": "Get photos by user success",
          "data": l
      }