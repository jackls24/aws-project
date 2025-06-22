import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import jwt

# Carica variabili da .env
load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
USER_POOL_ID = os.getenv("USER_POOL_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
IDENTITY_POOL_ID = os.getenv("IDENTITY_POOL_ID")

# Clienti AWS
cognito_idp = boto3.client("cognito-idp", region_name=AWS_REGION)
cognito_identity = boto3.client("cognito-identity", region_name=AWS_REGION)

def sign_up(username, password, email):
    try:

        return cognito_idp.sign_up(
            ClientId=CLIENT_ID,
            Username=username,
            Password=password,
            UserAttributes=[{"Name": "email", "Value": email}]
        )
    except ClientError as e:
        return {"error": e.response['Error']['Message']}


def confirm_sign_up(username, code):
    try:
        cognito_idp.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=username,
            ConfirmationCode=code
        )
        return {"status": "CONFIRMED"}
    except ClientError as e:
        return {"error": e.response['Error']['Message']}


def resend_confirmation_code(username):
    try:
        cognito_idp.resend_confirmation_code(
            ClientId=CLIENT_ID,
            Username=username
        )
        return {"status": "SENT"}
    except ClientError as e:
        return {"error": e.response['Error']['Message']}


def sign_in(username, password):
    try:
        auth = cognito_idp.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={"USERNAME": username, "PASSWORD": password}
        )

        tokens = auth["AuthenticationResult"]
        id_token = tokens["IdToken"]

        provider = f"cognito-idp.{AWS_REGION}.amazonaws.com/{USER_POOL_ID}"

        identity = cognito_identity.get_id(
            IdentityPoolId=IDENTITY_POOL_ID,
            Logins={provider: id_token}
        )

        creds = cognito_identity.get_credentials_for_identity(
            IdentityId=identity["IdentityId"],
            Logins={provider: id_token}
        )
        print(f"Credenziali temporanee ottenute per l'utente {identity}")
        print(f"Credenziali temporanee ottenute per l'utente {creds}")


        return {
            "tokens": tokens,
            "identityId": identity["IdentityId"],
            "awsCredentials": {
                "AccessKeyId": creds["Credentials"]["AccessKeyId"],
                "SecretKey": creds["Credentials"]["SecretKey"],
                "SessionToken": creds["Credentials"]["SessionToken"],
                "Expiration": creds["Credentials"]["Expiration"].isoformat()
            }
        }

    except ClientError as e:
        print(f"Errore durante il login ClientError: {e.response['Error']['Message']}")
        return {"error": e.response['Error']['Message']}


def validate_token(access_token):
    try:
        return cognito_idp.get_user(AccessToken=access_token)
    except ClientError as e:
        return {"error": e.response['Error']['Message']}


def get_temporary_credentials(id_token):
    try:
        decoded = jwt.decode(id_token, options={"verify_signature": False})
        if decoded.get("aud") != CLIENT_ID:
            return {"error": "Token 'aud' non corrisponde al CLIENT_ID"}

        provider = f"cognito-idp.{AWS_REGION}.amazonaws.com/{USER_POOL_ID}"

        identity = cognito_identity.get_id(
            IdentityPoolId=IDENTITY_POOL_ID,
            Logins={provider: id_token}
        )

        creds = cognito_identity.get_credentials_for_identity(
            IdentityId=identity["IdentityId"],
            Logins={provider: id_token}
        )

        return {
            "IdentityId": identity["IdentityId"],
            "Credentials": {
                "AccessKeyId": creds["Credentials"]["AccessKeyId"],
                "SecretKey": creds["Credentials"]["SecretKey"],
                "SessionToken": creds["Credentials"]["SessionToken"],
                "Expiration": creds["Credentials"]["Expiration"].isoformat()
            }
        }

    except ClientError as e:
        return {"error": e.response['Error']['Message']}
    except Exception as e:
        return {"error": str(e)}
