from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routes.upload import router as upload_router
from routes.images import router as images_router
from routes.auth import router as auth_router 

load_dotenv()

app = FastAPI(title="AWS Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AWS Backend API is running with FastAPI changed BY ACTION By Action NEWWW   NEW 18"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}




from routes.album import router as album_router

app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(images_router, prefix="/api", tags=["images"])
app.include_router(album_router, prefix="/api", tags=["albums"])



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
