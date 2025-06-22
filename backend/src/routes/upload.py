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

# Carica le variabili d'ambiente
load_dotenv()

router = APIRouter()

# Configurazione
AWS_REGION = os.environ.get('AWS_REGION')
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

# Funzione per ottenere un client S3 con credenziali temporanee
async def get_s3_client(id_token: str = None, authorization: Optional[str] = Header(None)):
    # Se viene fornito un token esplicito, usalo
    token = id_token
    
    # Altrimenti prova a estrarre il token dall'header Authorization
    if not token and authorization:
        if authorization.startswith('Bearer '):
            token = authorization.replace('Bearer ', '')
    
    if not token:
        raise HTTPException(status_code=401, detail="Token di autenticazione non fornito")
    
    try:
        # È fondamentale usare l'ID token, non l'access token
        # Il token JWT nell'header potrebbe essere un access token, che non funziona con Identity Pool
        
        print("Richiesta credenziali temporanee con token fornito")
        credentials = await get_temporary_credentials(token)
        
        if not credentials or not credentials.get('AccessKeyId'):
            # Se fallisce, prova a recuperare l'ID token dalla memoria
            id_token = os.environ.get('TEMP_ID_TOKEN')
            if id_token:
                print("Riprova con ID token memorizzato")
                credentials = await get_temporary_credentials(id_token)
            
            if not credentials or not credentials.get('AccessKeyId'):
                # Se fallisce ancora, usa le credenziali statiche come fallback
                print("Fallback alle credenziali statiche")
                s3_client = boto3.client(
                    's3',
                    region_name=AWS_REGION,
                    endpoint_url=f"https://s3.{AWS_REGION}.amazonaws.com",
                    config=botocore.config.Config(
                        signature_version='s3v4',
                        retries={'max_attempts': 3}
                    )
                )
                return s3_client
        
        # Crea un client S3 con le credenziali temporanee ottenute
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

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...), 
    name: Optional[str] = Form(None), 
    tags: Optional[str] = Form(None), 
    userId: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    try:
        print(f"Inizio upload. File: {file.filename}")
        
        # Estrai il token dall'header Authorization
        id_token = None
        if authorization and authorization.startswith('Bearer '):
            id_token = authorization.replace('Bearer ', '')
            print(f"ID token ricevuto per upload: {id_token[:10]}...")
        else:
            print("Nessun token fornito nell'header Authorization")
            # Usa il token memorizzato nel fallback (login)
            id_token = os.environ.get("TEMP_ID_TOKEN")
            if id_token:
                print("Utilizzo token memorizzato dal login")
        
        if not id_token:
            raise HTTPException(status_code=401, detail="Token di autenticazione non trovato")
            
        # Ottieni userId da token o parametro
        if not userId:
            # Usa JWT per estrarre info dall'ID token
            try:
                import jwt
                decoded = jwt.decode(id_token, options={"verify_signature": False})
                userId = decoded.get('cognito:username') or decoded.get('sub')
                print(f"Estratto userId dal token: {userId}")
            except Exception as e:
                print(f"Errore estrazione userId dal token: {str(e)}")
        
        # Leggi il contenuto del file
        file_content = await file.read()
        file_size = len(file_content)
        print(f"File letto: {file_size} bytes")
        
        # Genera nome unico
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        display_name = name or file.filename
        
        # Metadata semplificati
        metadata = {
            'originalname': file.filename,
            'displayname': display_name
        }
        
        if tags:
            metadata['tags'] = tags
        
        if userId:
            metadata['userid'] = userId
        
        # Estrai il token dall'header Authorization
        token = None
        if authorization and authorization.startswith('Bearer '):
            token = authorization.replace('Bearer ', '')
        
        # Ottieni un client S3 con credenziali temporanee
        s3_client = await get_s3_client(token, authorization)
        
        print(f"Inizia upload su S3. Bucket: {BUCKET_NAME}, Key: {unique_filename}")
        
        # Upload con gestione errori
        try:
            s3_client.put_object(
                Body=file_content,
                Bucket=BUCKET_NAME,
                Key=unique_filename,
                ContentType=file.content_type,
                Metadata=metadata,
                # Prova prima con ACL, se fallisce riprova senza
                ACL='public-read'
            )
            print("Upload su S3 completato con successo")
        except ClientError as acl_error:
            if 'AccessControlListNotSupported' in str(acl_error):
                # Riprova senza ACL
                s3_client.put_object(
                    Body=file_content,
                    Bucket=BUCKET_NAME,
                    Key=unique_filename,
                    ContentType=file.content_type,
                    Metadata=metadata,
                )
                print("Upload su S3 completato con successo (senza ACL)")
            else:
                raise acl_error
        
        # URL dell'immagine
        image_url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
        
        # Reimposta il file per eventuali usi futuri
        await file.seek(0)
        
        return JSONResponse({
            "message": "Image uploaded successfully",
            "url": image_url,
            "filename": unique_filename,
            "name": display_name,
            "tags": tags.split(',') if tags else []
        })
        
    except ClientError as e:
        # Log dettagliato dell'errore ClientError
        error_code = e.response.get('Error', {}).get('Code', '')
        error_msg = e.response.get('Error', {}).get('Message', '')
        print(f"AWS S3 error: {error_code} - {error_msg}")
        raise HTTPException(status_code=500, detail=f"AWS S3 error: {error_code} - {error_msg}")
    except HTTPException as he:
        # Rilancia le HTTP exceptions
        raise he
    except Exception as e:
        # Log per altri errori
        print(f"Errore durante l'upload: {str(e)}")
        import traceback
        print(traceback.format_exc())
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
        
        # Ottieni un client S3 con credenziali temporanee
        s3_client = await get_s3_client(token, authorization)
        
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=filename)
        return JSONResponse({"message": "Image deleted successfully"})
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"AWS S3 error: {str(e)}")
