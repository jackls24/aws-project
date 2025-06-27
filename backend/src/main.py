from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes.upload import router as upload_router
from auth.routes import router as auth_router


# Carica le variabili d'ambiente
load_dotenv()

app = FastAPI(title="AWS Backend API", version="1.0.0")

# Configurazione CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione, specifica i domini esatti
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AWS Backend API is running with FastAPI changed BY ACTION By Action NEWWW   NEW 5"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Importa le route per l'upload
app.include_router(upload_router, prefix="/api", tags=["api"])

# Importa le route di autenticazione
app.include_router(auth_router, prefix="/auth", tags=["authentication"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
