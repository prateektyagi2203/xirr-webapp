from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import numpy as np

print("🔥🔥 MAIN.PY LOADED 🔥🔥")

app = FastAPI()

# -----------------------
# CORS CONFIG (CRITICAL)
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow Vercel frontend
    allow_methods=["*"],   # POST, OPTIONS
    allow_headers=["*"],
)

# -----------------------
# DATA MODELS
# -----------------------
class CashFlow(BaseModel):
    date: str     # "YYYY-MM-DD"
    amount: float

class XIRRRequest(BaseModel):
    cashflows: List[CashFlow]

# -----------------------
# XIRR CALCULATION LOGIC
# -----------------------
def xnpv(rate, cashflows):
    t0 = cashflows[0][0]
    return sum(
        cf / ((1 + rate) ** ((t - t0).days / 365.0))
        for t, cf in cashflows
    )

def xirr(cashflows):
    rate = 0.1
    for _ in range(100):
        value = xnpv(rate, cashflows)
        derivative = (
            xnpv(rate + 1e-6, cashflows) - value
        ) / 1e-6

        if derivative == 0:
            break

        rate -= value / derivative

    return rate

# -----------------------
# API ROUTES
# -----------------------
@app.get("/")
def health():
    return {"status": "Backend is running"}

@app.post("/xirr")
def calculate_xirr(req: XIRRRequest):
    if len(req.cashflows) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least two cashflows are required"
        )

    try:
        cashflows = [
            (datetime.strptime(cf.date, "%Y-%m-%d"), cf.amount)
            for cf in req.cashflows
        ]

        result = xirr(cashflows)

        return {
            "xirr": round(result * 100, 2)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



