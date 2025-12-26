from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import numpy as np

app = FastAPI()

# ✅ CORS CONFIGURATION (THIS IS THE FIX)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins (safe for this demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Cashflow(BaseModel):
    date: str
    amount: float

class XIRRRequest(BaseModel):
    cashflows: List[Cashflow]

def xirr(cashflows):
    dates = [datetime.strptime(cf.date, "%Y-%m-%d") for cf in cashflows]
    amounts = [cf.amount for cf in cashflows]

    days = [(d - dates[0]).days for d in dates]
    years = [d / 365.0 for d in days]

    def npv(rate):
        return sum(
            amounts[i] / ((1 + rate) ** years[i])
            for i in range(len(amounts))
        )

    rate = 0.1
    for _ in range(100):
        rate -= npv(rate) / 1000

    return rate * 100

@app.post("/xirr")
def calculate_xirr(req: XIRRRequest):
    result = xirr(req.cashflows)
    return {"xirr": round(result, 2)}
