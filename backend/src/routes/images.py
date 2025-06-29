from fastapi import APIRouter, HTTPException
import boto3
import os
from botocore.exceptions import ClientError
router = APIRouter()

s3_client = boto3.client(
    's3',
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

BUCKET_NAME = os.getenv('S3_BUCKET_NAME')


@router.get("/images/{user_id}")
async def get_user_images(user_id: str):
    """Ottieni le immagini di un utente specifico"""
    try:
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=f"users/{user_id}/"
        )
        
        images = []
        if 'Contents' in response:
            for obj in response['Contents']:
                image_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'us-east-1')}.amazonaws.com/{obj['Key']}"
                
                images.append({
                    "filename": obj['Key'],
                    "url": image_url,
                    "size": obj['Size'],
                    "last_modified": obj['LastModified'].isoformat()
                })
        
        return {"images": images}
        
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Errore S3: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero: {str(e)}")