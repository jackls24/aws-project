from fastapi import APIRouter, HTTPException
import os
import requests
import base64
from pydantic import BaseModel

router = APIRouter()

class CodeExchangeRequest(BaseModel):
    code: str
    redirect_uri: str

@router.post("/exchange-code")
async def exchange_code_for_tokens(request: CodeExchangeRequest):
    try:
        client_id = os.getenv('CLIENT_ID')
        client_secret = os.getenv('CLIENT_SECRET') 
        user_pool_domain = os.getenv('USER_POOL_DOMAIN')
        
        if not client_id:
            raise HTTPException(status_code=500, detail="CLIENT_ID non configurato")
        
        if not user_pool_domain:
            raise HTTPException(status_code=500, detail="USER_POOL_DOMAIN non configurato")
        
        user_pool_domain = user_pool_domain.rstrip('/')
        token_url = f"{user_pool_domain}/oauth2/token"
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        if client_secret:
            credentials = f"{client_id}:{client_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            headers['Authorization'] = f"Basic {encoded_credentials}"
        
        data = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'code': request.code,
            'redirect_uri': request.redirect_uri
        }
        
        response = requests.post(token_url, headers=headers, data=data)
        
        if response.status_code != 200:
            if "invalid_grant" in response.text:
                raise HTTPException(
                    status_code=400, 
                    detail="Codice di autorizzazione non valido o già utilizzato. Effettua un nuovo login."
                )
            else:
                raise HTTPException(status_code=400, detail=f"Errore Cognito ({response.status_code}): {response.text}")
        
        return response.json()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante lo scambio del codice: {str(e)}")