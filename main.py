from fastapi import FastAPI
from pydantic import BaseModel
import os
import uvicorn
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


MI_TO_KM = 1.60934


class SetSpeedRequest(BaseModel):
    mph: float


app = FastAPI()
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.system("./startup.sh")

async def check_and_reconnect_if_needed():
    devices_output = os.popen("adb devices").read()
    connected = False
    for line in devices_output.strip().split('\n')[1:]:
        if "device" in line.split('\t'):
            connected = True
            break
    
    if not connected:
        print("INFO: Device disconnected. Attempting to reconnect...")
        os.system("./reconnect.sh")
    else:
        print("INFO: Device connected. No action needed.")

async def periodic_status_check():
    while True:
        print("INFO: Running periodic status check...")
        await check_and_reconnect_if_needed()
        await asyncio.sleep(60)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_status_check())

def set_speed_grpc(kph):
    cmd = f'grpcurl -H "client_id: com.ifit.eriador" -insecure -protoset protos/speedservice.protoset -cert keys/cert.txt -key keys/key.txt -cacert keys/ca_cert.txt -d \'{{"kph": {kph}}}\' localhost:54321 com.ifit.glassos.SpeedService/SetSpeed'
    os.system(cmd)

@app.post("/set_speed")
async def set_speed(req: SetSpeedRequest):
    print(f"Setting speed to {req.mph} mph")
    kph = MI_TO_KM * req.mph
    set_speed_grpc(kph)
    return kph

@app.get("/reconnect")
async def reconnect():
    os.system("./reconnect.sh")
    return {"message": "Reconnected"}

@app.get("/status")
async def status():
    devices_output = os.popen("adb devices").read()
    for line in devices_output.strip().split('\n')[1:]:
        if "device" in line.split('\t'):
            return {"connected": True}
    return {"connected": False}


app.mount('/', StaticFiles(directory='./frontend/dist', html=True))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
