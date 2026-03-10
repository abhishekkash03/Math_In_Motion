

# README.md

## Math In Motion

Math In Motion is a system that connects a **React frontend** with a **FastAPI backend** to generate mathematical patterns and send them to a **robot arm** for execution.

The frontend allows users to select mathematical patterns visually, and the backend converts them into **URScript commands** that can be sent to the robot.

The backend can also run in **safe mode**, allowing development without connecting to the robot.

---

# Architecture Overview

```
React Frontend
      |
      | HTTP Request
      v
FastAPI Backend
      |
      | Load URScript Pattern
      v
Robot Controller (TCP Socket)
```

Flow:

1. User selects a pattern in the frontend
2. Frontend sends request to backend
3. Backend loads the corresponding URScript file
4. Backend sends the script to the robot (optional)
5. Robot executes the motion

---

# Project Structure

```
Math_In_Motion_v1
│
├── backend
│   │ main.py
│   │
│   ├── api
│   │     models.py
│   │     routes.py
│   │
│   ├── robot
│   │     socket_client.py
│   │
│   ├── services
│   │     script_loader.py
│   │
│   └── scripts
│         aizawa.urscript
│         butterfly.urscript
│         spiral.urscript
│         heart.urscript
│         ...
│
└── Frontends
    │ package.json
    │ vite.config.ts
    │ index.html
    │
    └── src
        ├── api
        ├── components
        ├── formulas
        └── pages
```

---

# Backend Setup (FastAPI)

## Requirements

Python **3.10+ recommended**

---

## Create Python Environment

Developers can use either **venv** or **conda**.

### Option 1 — Python venv

```
python -m venv venv
```

Activate:

Windows

```
venv\Scripts\activate
```

Mac/Linux

```
source venv/bin/activate
```

---

### Option 2 — Conda

```
conda create -n math_motion python=3.13
conda activate math_motion
```

---

## Install Dependencies

```
pip install fastapi uvicorn pydantic
```

Optional scientific packages used in development:

```
pip install numpy matplotlib scipy scikit-learn librosa pygame
```

---

## Run Backend

Navigate to backend folder:

```
cd backend
```

Run server:

```
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will start at:

```
http://localhost:8000
```

Test:

```
http://localhost:8000
```

Expected response:

```
{"message": "Math In Motion Backend Running"}
```

---

# Backend Safe Mode

The robot execution is controlled by this field:

```
run: false
```

Example request:

```
POST /execute
```

Body:

```
{
  "pattern": "spiral",
  "run": false
}
```

Safe mode:

* script is generated
* robot is NOT executed

Robot executes only if:

```
run = true
```

---

# Frontend Setup (React + Vite)

Navigate to frontend:

```
cd Frontends
```

Install dependencies:

```
npm install
```

---

## Environment Configuration

Create `.env` file or edit existing one.

Example:

```
VITE_API_URL=http://localhost:8000
```

If accessing backend from another device on the network:

```
VITE_API_URL=http://172.16.80.123:8000
```

---

## Run Frontend

```
npm run dev
```

Frontend will start at:

```
http://localhost:5173
```

---

# Running Full System

Start backend first.

Terminal 1

```
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Terminal 2

```
cd Frontends
npm install
npm run dev
```

Open browser:

```
http://localhost:5173
```

---

# Robot Integration

The backend sends scripts to the robot using TCP socket.

Default robot IP:

```
192.168.1.20
```

Connection port:

```
30002
```

Only executed when:

```
run = true
```

---

# API Endpoints

### Root

```
GET /
```

Response:

```
Math In Motion Backend Running
```

---

### Execute Pattern

```
POST /execute
```

Body:

```
{
  "pattern": "spiral",
  "run": true
}
```

Response:

```
{
  "pattern": "spiral",
  "robot": {
    "status": "EXECUTED"
  }
}
```

---

# Troubleshooting

### CORS errors

Make sure frontend origin is allowed in:

```
main.py
```

---

### Robot connection error

If robot is not connected:

```
run = false
```

---

### Port already in use

Change backend port:

```
--port 8001
```

and update frontend `.env`.

---

# Backend Explained (Super Simple)

Imagine the backend like a **robot translator**.

### Step 1 — Someone presses a button

Frontend says:

```
"Hey backend, draw a spiral!"
```

---

### Step 2 — Backend looks for instructions

It goes to the **scripts folder**:

```
scripts/spiral.urscript
```

and loads the robot instructions.

---

### Step 3 — Backend talks to the robot

The backend opens a **network socket** to the robot.

It says:

```
Robot, here are your instructions.
Start drawing!
```

---

### Step 4 — Robot moves

Robot arm executes the script.

If safe mode:

```
run = false
```

Backend just says:

```
I would have sent this to the robot,
but I'm not doing it now.
```

---

# Backend Files Explained

### main.py

Creates the FastAPI server and enables CORS.

Think of it as the **front door** of the backend.

---

### routes.py

Defines API endpoints like:

```
/execute
```

This is where frontend requests arrive.

---

### models.py

Defines request structure using Pydantic.

Example:

```
pattern
run
```

This ensures requests are valid.

---

### script_loader.py

Loads the URScript file from the scripts folder.

---

### socket_client.py

Handles TCP connection to the robot.

It sends the script to the robot controller.

---

# Safe Development Mode

Developers can run everything **without the robot**.

Just send:

```
run: false
```

This allows UI development and testing.

---

# Future Improvements (Recommended)

• requirements.txt
• Docker setup
• automatic pattern listing API
• robot simulation mode
• logging system

---

