from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel
import boto3
import os
from auth.cognito_auth import get_cognito_credentials

router = APIRouter()

class AlbumCreateRequest(BaseModel):
    albumName: str
    userId: str

@router.get("/albums/{user_id}")
async def list_albums(user_id: str, authorization: str = Header(None)):
    bucket_name = os.getenv("S3_BUCKET_NAME")
    aws_region = os.getenv("AWS_REGION", "us-east-1")
    if not bucket_name:
        raise HTTPException(status_code=500, detail="Bucket S3 non configurato")
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Token ID mancante")
    id_token = authorization.split(' ')[1]
    credentials = get_cognito_credentials(id_token)
    s3 = boto3.client(
        "s3",
        aws_access_key_id=credentials['AccessKeyId'],
        aws_secret_access_key=credentials['SecretKey'],
        aws_session_token=credentials['SessionToken'],
        region_name=aws_region
    )
    prefix = f"users/{user_id}/"
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix, Delimiter="/")
        albums = []
        # CommonPrefixes contiene le "cartelle" (album)
        for cp in response.get('CommonPrefixes', []):
            folder = cp.get('Prefix')
            # Estraggo solo il nome album
            parts = folder[len(prefix):].strip('/').split('/')
            if parts and parts[0]:
                albums.append(parts[0])
        return {"albums": albums}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore S3: {str(e)}")


@router.post("/albums", status_code=status.HTTP_201_CREATED)
async def create_album(data: AlbumCreateRequest, authorization: str = Header(None)):
    bucket_name = os.getenv("S3_BUCKET_NAME")
    aws_region = os.getenv("AWS_REGION", "us-east-1")
    if not bucket_name:
        raise HTTPException(status_code=500, detail="Bucket S3 non configurato")
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Token ID mancante")
    id_token = authorization.split(' ')[1]
    credentials = get_cognito_credentials(id_token)
    s3 = boto3.client(
        "s3",
        aws_access_key_id=credentials['AccessKeyId'],
        aws_secret_access_key=credentials['SecretKey'],
        aws_session_token=credentials['SessionToken'],
        region_name=aws_region
    )
    folder_key = f"users/{data.userId}/{data.albumName}/"
    try:
        s3.put_object(Bucket=bucket_name, Key=folder_key)
        return {"message": f"Album '{data.albumName}' creato per utente '{data.userId}'"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore S3: {str(e)}")


@router.delete("/albums/{album_name}/{user_id}", status_code=status.HTTP_200_OK)
async def delete_album(album_name: str, user_id: str, authorization: str = Header(None)):
    bucket_name = os.getenv("S3_BUCKET_NAME")
    aws_region = os.getenv("AWS_REGION", "us-east-1")
    if not bucket_name:
        raise HTTPException(status_code=500, detail="Bucket S3 non configurato")
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Token ID mancante")
    
    id_token = authorization.split(' ')[1]
    credentials = get_cognito_credentials(id_token)

    s3 = boto3.client(
        "s3",
        aws_access_key_id=credentials['AccessKeyId'],
        aws_secret_access_key=credentials['SecretKey'],
        aws_session_token=credentials['SessionToken'],
        region_name=aws_region
    )

    folder_prefix = f"users/{user_id}/{album_name}/"
    try:
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix=folder_prefix)
        all_keys = []
        for page in pages:
            for obj in page.get('Contents', []):
                all_keys.append({'Key': obj['Key']})
        if all_keys:
            s3.delete_objects(Bucket=bucket_name, Delete={'Objects': all_keys})

        try:
            s3.delete_object(Bucket=bucket_name, Key=folder_prefix)
        except Exception:
            pass

        return {"message": f"Album '{album_name}' eliminato per utente '{user_id}'"}
    except Exception as e:
        print("DELETE ALBUM ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Errore S3: {str(e)}")