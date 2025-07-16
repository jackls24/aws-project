from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form, Header
from fastapi.responses import JSONResponse
import boto3
import os
import botocore
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import uuid
from typing import Optional
from auth.routes import get_current_user
from auth.cognito_auth import get_temporary_credentials
from jose import jwt

# Carica le variabili d'ambiente
load_dotenv()

router = APIRouter()

# Configurazione
AWS_REGION = os.environ.get('AWS_REGION')
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

def get_s3_client(id_token: str = None, authorization: Optional[str] = Header(None)):
    """
    Ottiene un client S3 autenticato con credenziali temporanee Cognito.
    - Usa l'id_token passato o lo estrae dall'header Authorization.
    - Verifica che il token sia un ID token Cognito.
    - Logga il payload JWT per debug.
    - Solleva HTTPException 401 se il token non è valido.
    """
    # Estrai il token JWT
    token = id_token
    if not token and authorization:
        if authorization.startswith('Bearer '):
            token = authorization.replace('Bearer ', '')
    if not token:
        raise HTTPException(status_code=401, detail="Token di autenticazione non fornito")

    # Decodifica e verifica il token
    try:
        decoded = jwt.decode(
            token,
            key="",
            options={
                "verify_signature": False,
                "verify_aud": False,
                "verify_at_hash": False
            }
        )
        print(f"DEBUG JWT PAYLOAD (get_s3_client): {decoded}")
        token_use = decoded.get("token_use")
        aud = decoded.get("aud")
        if token_use != "id":
            print("⚠️  Il token fornito NON è un ID token Cognito. Serve l'ID token, non l'access token.")
            raise HTTPException(status_code=401, detail="Il token fornito non è un ID token Cognito.")
    except Exception as e:
        print(f"Impossibile decodificare il token JWT: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Token JWT non valido: {str(e)}")

    # Ottieni credenziali temporanee AWS tramite Cognito
    credentials = get_temporary_credentials(token)
    if not credentials or not credentials.get('AccessKeyId'):
        print(f"Credenziali temporanee non ottenute. Risposta: {credentials}")
        raise HTTPException(status_code=401, detail="Credenziali AWS temporanee non ottenute. Effettua nuovamente il login.")

    # Crea e restituisci il client S3 autenticato
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=credentials['AccessKeyId'],
            aws_secret_access_key=credentials['SecretKey'],
            aws_session_token=credentials['SessionToken'],
            region_name=AWS_REGION,
            config=botocore.config.Config(
                signature_version='s3v4',
                retries={'max_attempts': 3}
            )
        )
        return s3_client
    except Exception as e:
        print(f"Errore nella creazione del client S3: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Errore di configurazione S3: {str(e)}")

def extract_id_token(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.startswith('Bearer '):
        return authorization.replace('Bearer ', '')
    return os.environ.get("TEMP_ID_TOKEN")

def extract_user_id(id_token: str) -> Optional[str]:
    try:
        decoded = jwt.decode(id_token, key="", options={"verify_signature": False})
        if decoded.get("token_use") != "id":
            raise ValueError("Il token fornito non è un ID token Cognito.")
        return decoded.get('cognito:username') or decoded.get('sub')
    except Exception as e:
        print(f"Errore estrazione userId dal token: {str(e)}")
        return None

def generate_s3_key(user_id: Optional[str], file: UploadFile) -> str:
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
    s3_folder = f"users/{user_id}" if user_id else "user/anonymous"
    return f"{s3_folder}/{uuid.uuid4().hex}.{file_extension}"

def build_metadata(file: UploadFile, display_name: str, tags: Optional[str], user_id: Optional[str]) -> dict:
    metadata = {
        'originalname': file.filename,
        'displayname': display_name
    }
    if tags:
        metadata['tags'] = tags
    if user_id:
        metadata['userid'] = str(user_id)
    return metadata

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...), 
    name: Optional[str] = Form(None), 
    tags: Optional[str] = Form(None), 
    userId: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    try:
        id_token = extract_id_token(authorization)
        if not id_token:
            raise HTTPException(status_code=401, detail="Token di autenticazione non trovato")

        user_id = userId or extract_user_id(id_token)
        if not user_id:
            raise HTTPException(status_code=401, detail="UserId non trovato nel token")

        file_content = await file.read()
        display_name = name or file.filename
        unique_filename = generate_s3_key(user_id, file)
        metadata = build_metadata(file, display_name, tags, user_id)

        s3_client = get_s3_client(id_token, authorization)

        s3_client.put_object(
            Body=file_content,
            Bucket=BUCKET_NAME,
            Key=unique_filename,
            ContentType=file.content_type,
            Metadata=metadata
        )
        image_url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
        await file.seek(0)

        return JSONResponse({
            "message": "Image uploaded successfully",
            "url": image_url,
            "filename": unique_filename,
            "name": display_name,
            "tags": tags.split(',') if tags else []
        })

    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', '')
        error_msg = e.response.get('Error', {}).get('Message', '')
        print(f"AWS S3 error: {error_code} - {error_msg}")
        raise HTTPException(status_code=500, detail=f"AWS S3 error: {error_code} - {error_msg}")
    except Exception as e:
        print(f"Errore durante l'upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")

@router.delete("/delete/{filename}")
async def delete_image(
    filename: str, 
    current_user = Depends(get_current_user),
    authorization: Optional[str] = Header(None)
):
    try:
        token = None
        if authorization and authorization.startswith('Bearer '):
            token = authorization.replace('Bearer ', '')
        s3_client = get_s3_client(token, authorization)
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=filename)
        return JSONResponse({"message": "Image deleted successfully"})
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"AWS S3 error: {str(e)}")
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=filename)
        return JSONResponse({"message": "Image deleted successfully"})