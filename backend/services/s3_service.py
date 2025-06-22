from botocore.exceptions import NoCredentialsError
import boto3
from flask import current_app

def upload_image_to_s3(image_file, bucket_name, object_name=None):
    if object_name is None:
        object_name = image_file.filename

    s3_client = boto3.client(
        's3',
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY'],
        aws_secret_access_key=current_app.config['AWS_SECRET_KEY'],
        region_name=current_app.config['AWS_REGION']
    )

    try:
        s3_client.upload_fileobj(image_file, bucket_name, object_name)
        return f"https://{bucket_name}.s3.{current_app.config['AWS_REGION']}.amazonaws.com/{object_name}"
    except NoCredentialsError:
        return "Credentials not available"
    except Exception as e:
        return str(e)

def get_image_url(bucket_name, object_name):
    return f"https://{bucket_name}.s3.{current_app.config['AWS_REGION']}.amazonaws.com/{object_name}"