from botocore.exceptions import ClientError
import boto3
from utils.config import AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID

class CognitoService:
    def __init__(self):
        self.client = boto3.client('cognito-idp', region_name=AWS_REGION)

    def sign_up(self, username, password, user_attributes):
        try:
            response = self.client.sign_up(
                ClientId=COGNITO_CLIENT_ID,
                Username=username,
                Password=password,
                UserAttributes=user_attributes
            )
            return response
        except ClientError as e:
            return e.response['Error']['Message']

    def sign_in(self, username, password):
        try:
            response = self.client.initiate_auth(
                ClientId=COGNITO_CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': username,
                    'PASSWORD': password
                }
            )
            return response['AuthenticationResult']
        except ClientError as e:
            return e.response['Error']['Message']

    def get_user(self, access_token):
        try:
            response = self.client.get_user(
                AccessToken=access_token
            )
            return response
        except ClientError as e:
            return e.response['Error']['Message']