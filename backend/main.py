from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI()

# ✅ CORS (keep this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Explicit OPTIONS handler (THIS IS THE KEY)
@app.options("/xirr")
def options_xirr():
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        },
    )

class Cashflow(BaseModel):
    date: str
    amount: float

class XIRRRequest(BaseModel):
    cashflows: List[Cashflow]

def xirr(cashflows):
    dates = [datetime.strptime(c.date, "%Y-%m-%d") for c in cashflows]
    amounts = [c.amount for c in cashflows]

    days = [(d - dates[0]).days for d in dates]
    years = [d / 365 for d in days]

    rate = 0.1
    for _ in range(100):
        rate -= sum(
            amounts[i] / ((1 + rate) ** years[i])
            for i in range(len(amounts))
        ) / 1000

    return rate * 100

@app.post("/xirr")
def calculate_xirr(req: XIRRRequest):
    return {"xirr": round(xirr(req.cashflows), 2)}

