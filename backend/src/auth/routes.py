from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from .cognito_auth import sign_up, sign_in, validate_token, confirm_sign_up, resend_confirmation_code
import os

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Modelli di dati
class UserSignUp(BaseModel):
    username: str
    password: str
    email: str

class UserSignIn(BaseModel):
    username: str
    password: str

class UserConfirm(BaseModel):
    username: str
    confirmation_code: str

class ResendCode(BaseModel):
    username: str

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Non autorizzato")
    
    # Rimuovi il prefisso "Bearer " se presente
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    # Controlla prima se è un access token valido
    try:
        # validate_token usa cognito_idp_client.get_user che richiede un Access Token
        user = validate_token(token)
        if isinstance(user, str):  # Se è una stringa, è un messaggio di errore
            raise HTTPException(status_code=401, detail=user)
        return user
    except Exception as e:
        # Se il token non è valido come Access Token, potrebbe essere un ID token
        # In questo caso, non possiamo utilizzarlo direttamente con get_user
        print(f"Errore durante la validazione del token: {str(e)}")
        raise HTTPException(
            status_code=401, 
            detail="Token non valido o scaduto. Utilizzare un Access Token valido."
        )

@router.post("/signup")
async def register_user(user: UserSignUp):
    response = sign_up(user.username, user.password, user.email)
    if isinstance(response, str):  # Se è una stringa, è un messaggio di errore
        raise HTTPException(status_code=400, detail=response)
    
    return {
        "message": "Utente registrato con successo",
        "username": user.username,
        "user_sub": response["UserSub"],
        "status": "CONFIRMATION_REQUIRED" if response.get("UserConfirmed") is False else "CONFIRMED"
    }

@router.post("/confirm")
async def confirm_account(confirm_data: UserConfirm):
    response = confirm_sign_up(confirm_data.username, confirm_data.confirmation_code)
    if isinstance(response, str):  # Se è una stringa, è un messaggio di errore
        raise HTTPException(status_code=400, detail=response)
    
    return {
        "message": "Account confermato con successo",
        "username": confirm_data.username,
        "status": "CONFIRMED"
    }

@router.post("/resend-code")
async def resend_verification(resend_data: ResendCode):
    response = resend_confirmation_code(resend_data.username)
    if isinstance(response, str):  # Se è una stringa, è un messaggio di errore
        raise HTTPException(status_code=400, detail=response)
    
    return {
        "message": "Codice di conferma inviato nuovamente",
        "username": resend_data.username
    }

@router.post("/login")
async def login_user(user: UserSignIn):
    response = sign_in(user.username, user.password)

    print(f"Risposta login: {response}")

    
    # Memorizza entrambi i token per poterli usare appropriatamente
    if "IdToken" in response:
        os.environ["TEMP_ID_TOKEN"] = response["IdToken"]
    if "AccessToken" in response:
        os.environ["TEMP_ACCESS_TOKEN"] = response["AccessToken"]
    
    # Aggiungi info aggiuntive per debugging
    print(f"Login riuscito per {user.username}")
    print(f"Access Token presente: {'AccessToken' in response}")
    print(f"ID Token presente: {'IdToken' in response}")
    
    response["username"] = user.username
    return response

@router.get("/me")
async def get_user_info(user = Depends(get_current_user)):
    return {
        "username": user["Username"],
        "user_attributes": user["UserAttributes"]
    }
