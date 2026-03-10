from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(title="Math In Motion Backend")

# Allow frontend origin
origins = [
    "http://localhost:3000",
    "http://192.168.1.45:3000",
    "http://172.16.80.123:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Math In Motion Backend Running"}