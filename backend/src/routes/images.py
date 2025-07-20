from fastapi import APIRouter, HTTPException, Header
import boto3
import os
from botocore.exceptions import ClientError
from auth.cognito_auth import get_cognito_credentials

router = APIRouter()

BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
IDENTITY_POOL_ID = os.getenv('IDENTITY_POOL_ID')
USER_POOL_ID = os.getenv('USER_POOL_ID')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
DYNAMODB_TABLE = 'ImageLabels'


def get_image_tags(dynamodb_client, user_id: str, filename: str):
    try:
        image_key = f"users/{user_id}/{filename}"
        response = dynamodb_client.get_item(
            TableName=DYNAMODB_TABLE,
            Key={
                'ImageKey': {'S': image_key}
            }
        )
        # Estrai i tag da 'LabelNames' se presente, altrimenti da 'Labels'
        item = response.get('Item', {})
        tags = []
        if 'LabelNames' in item:
            labelnames = item['LabelNames']['L']
            tags = [label['S'] for label in labelnames if isinstance(label, dict) and 'S' in label]
        elif 'Labels' in item:
            labels = item['Labels']['L']
            for label in labels:
                if 'M' in label and 'Name' in label['M'] and 'S' in label['M']['Name']:
                    tags.append(label['M']['Name']['S'])
        return tags
    except Exception as e:
        print(f"Errore in get_image_tags: {str(e)}")
        return []

    



@router.get("/images/{user_id}")
async def get_user_images(user_id: str, authorization: str = Header(None)):
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Token ID mancante")
        id_token = authorization.split(' ')[1]
        credentials = get_cognito_credentials(id_token)
        s3_client = boto3.client(
            's3',
            aws_access_key_id=credentials['AccessKeyId'],
            aws_secret_access_key=credentials['SecretKey'],
            aws_session_token=credentials['SessionToken'],
            region_name=AWS_REGION
        )
        dynamodb_client = boto3.client(
            'dynamodb',
            aws_access_key_id=credentials['AccessKeyId'],
            aws_secret_access_key=credentials['SecretKey'],
            aws_session_token=credentials['SessionToken'],
            region_name=AWS_REGION
        )
        if not BUCKET_NAME:
            raise HTTPException(status_code=500, detail="S3_BUCKET_NAME non configurato")
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=f"users/{user_id}/"
        )

        images = []
        albums = {}
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                if key.endswith('/'):
                    album_name = key[len(f"users/{user_id}/"):].strip('/')
                    if album_name:
                        albums[album_name] = []
                    continue
                image_url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
                filename = key.split('/')[-1]
                tags = get_image_tags(dynamodb_client, user_id, filename)
                metadata = {}
                try:
                    head = s3_client.head_object(Bucket=BUCKET_NAME, Key=key)
                    metadata = head.get('Metadata', {})
                except Exception as meta_err:
                    print(f"Errore recupero metadata per {key}: {meta_err}")
                image_obj = {
                    "name": filename,
                    "filename": key,
                    "url": image_url,
                    "size": obj['Size'],
                    "last_modified": obj['LastModified'].isoformat(),
                    "tags": tags,
                    "owner": user_id,
                    "metadata": metadata
                }
                images.append(image_obj)
                # Raggruppa per album
                parts = key[len(f"users/{user_id}/"):].split('/')
                if len(parts) > 1:
                    album = parts[0]
                    if album not in albums:
                        albums[album] = []
                    albums[album].append(image_obj)
        # Costruisci la risposta
        return {
            "images": images,
            "album": [
                {
                    "albumName": album,
                    "images": imgs
                } for album, imgs in albums.items()
            ]
        }
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Errore S3: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero: {str(e)}")

@router.get("/tags/{user_id}")
async def get_user_tags(user_id: str, authorization: str = Header(None)):
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Token ID mancante")
        
        id_token = authorization.split(' ')[1]
        
        credentials = get_cognito_credentials(id_token)
        
        dynamodb_client = boto3.client(
            'dynamodb',
            aws_access_key_id=credentials['AccessKeyId'],
            aws_secret_access_key=credentials['SecretKey'],
            aws_session_token=credentials['SessionToken'],
            region_name=AWS_REGION
        )
        
        response = dynamodb_client.scan(
            TableName=DYNAMODB_TABLE,
            FilterExpression='UserId = :user_id',
            ExpressionAttributeValues={
                ':user_id': {'S': user_id}
            }
        )
        
        tag_counts = {}
        
        for item in response['Items']:
            if 'Labels' in item:
                labels = item['Labels']['L']
                for label in labels:
                    tag = label['S']
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        tags = [{"tag": tag, "count": count} for tag, count in tag_counts.items()]
        tags.sort(key=lambda x: x['count'], reverse=True)
        
        return {"tags": tags}
        
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Errore DynamoDB: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero tag: {str(e)}")

@router.delete("/images/{user_id}/{filename}")
async def delete_user_image(user_id: str, filename: str, authorization: str = Header(None)):
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Token ID mancante")
        id_token = authorization.split(' ')[1]
        credentials = get_cognito_credentials(id_token)

        s3_client = boto3.client(
            's3',
            aws_access_key_id=credentials['AccessKeyId'],
            aws_secret_access_key=credentials['SecretKey'],
            aws_session_token=credentials['SessionToken'],
            region_name=AWS_REGION
        )

        key = f"users/{user_id}/{filename}"
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=key)
        return {"message": "Image deleted successfully", "filename": key}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Errore S3: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'eliminazione: {str(e)}")


# API per spostare un'immagine tra album
from pydantic import BaseModel

class MoveImageRequest(BaseModel):
    userId: str
    filename: str
    targetAlbum: str

@router.post("/images/move")
async def move_image_to_album(data: MoveImageRequest, authorization: str = Header(None)):
    try:
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Token ID mancante")
        id_token = authorization.split(' ')[1]
        credentials = get_cognito_credentials(id_token)

        s3_client = boto3.client(
            's3',
            aws_access_key_id=credentials['AccessKeyId'],
            aws_secret_access_key=credentials['SecretKey'],
            aws_session_token=credentials['SessionToken'],
            region_name=AWS_REGION
        )

        source_key = f"users/{data.userId}/{data.filename}"
        target_key = f"users/{data.userId}/{data.targetAlbum}/{data.filename}"

        
        s3_client.copy_object(
            Bucket=BUCKET_NAME,
            CopySource={"Bucket": BUCKET_NAME, "Key": source_key},
            Key=target_key
        )
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=source_key)

        return {"message": "Immagine spostata con successo", "filename": data.filename, "targetAlbum": data.targetAlbum}
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Errore S3: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante lo spostamento: {str(e)}")