from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db_conn import SessionLocal
from models import User
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, validator
import re
import os
import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import secrets

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/auth", tags=["auth"])

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Function to get current user from JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


# signup schema
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain a special character")
        return v


# signup endpoint
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    # check for existing email/username
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    # hash password
    password_bytes = user.password.encode('utf-8')[:72]
    hashed_password = pwd_context.hash(password_bytes.decode('utf-8'))

    # create user with verification token
    verification_token = secrets.token_urlsafe(32)
    token_expires = datetime.utcnow() + timedelta(hours=1)

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        verification_token=verification_token,
        verification_token_expires=token_expires,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # generate verification link (replace with real email later)
    verification_link = f"http://localhost:3000/auth/verify-email?token={verification_token}"
    print(f"[DEBUG] Send this link to user: {verification_link}")

    return {"msg": "User created successfully. Check your email to verify your account."}


# email verification endpoint
@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    if datetime.utcnow() > user.verification_token_expires:
        raise HTTPException(status_code=400, detail="Token has expired")

    # verify user
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()

    return {"msg": "Email verified successfully!"}


# login schema
class LoginRequest(BaseModel):
    username_or_email: str
    password: str

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # find user by username or email
    user = db.query(User).filter(
        (User.username == data.username_or_email) | (User.email == data.username_or_email)
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Username or email doesn't exist")

    # verify password
    if not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Password incorrect")

    # generate JWT
    payload = {"sub": user.username, "exp": datetime.utcnow() + timedelta(hours=1)}
    token = jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")

    return {"access_token": token, "token_type": "bearer", "username": user.username}


# Get current user info endpoint
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's information
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at
    }