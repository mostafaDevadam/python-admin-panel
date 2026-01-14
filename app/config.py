from pathlib import Path
import os

from dotenv import load_dotenv
from pydantic.v1 import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv()
class Settings(BaseSettings):
      #
      DEBUG: bool = os.getenv("DEBUG")
      ENV:str = "development"


      #
      DB_URL: str = os.getenv("DB_URL")
      POOL_PRE_PING: bool = True
      POOL_SIZE: int = 20
      MAX_OVERFLOW: int = 10
      POOL_TIMEOUT = 10
      POOL_RECYCLE = 1800
      #
      JWT_SECRET: str = os.getenv("JWT_SECRET")
      JWT_ALGORITHM: str = os.getenv("ALGORITHM")
      ALGORITHM: str = os.getenv("ALGORITHM")
      ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
      REFRESH_TOKEN_EXPIRE_MINUTES: int = os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES")
      REFRESH_EXPIRE=os.getenv("REFRESH_EXPIRE")
      REFRESH_TOKEN_EXPIRE_DAYS: int=7
      #
      BACKEND_CORS_ORIGINS: list[str] = [os.getenv("CLIENT_URL")]

      class Config:
          env_file = BASE_DIR/".env"
          env_file_encoding = "utf-8"


settings = Settings()