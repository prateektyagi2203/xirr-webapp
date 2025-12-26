from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CashFlow(BaseModel):
    date: str
    amount: float

class XIRRRequest(BaseModel):
    cashflows: list[CashFlow]

def xirr(cash_flows, dates, guess=0.1):
    tolerance = 1e-6
    max_iterations = 1000
    date0 = dates[0]

    def npv(rate):
        return sum(
            cf / ((1 + rate) ** ((date - date0).days / 365))
            for cf, date in zip(cash_flows, dates)
        )

    def d_npv(rate):
        return sum(
            -cf * ((date - date0).days / 365) /
            ((1 + rate) ** (((date - date0).days / 365) + 1))
            for cf, date in zip(cash_flows, dates)
        )

    rate = guess
    for _ in range(max_iterations):
        value = npv(rate)
        if abs(value) < tolerance:
            return rate
        rate -= value / d_npv(rate)

    return None

@app.post("/xirr")
def calculate_xirr(req: XIRRRequest):
    cash_flows = [cf.amount for cf in req.cashflows]
    dates = [datetime.strptime(cf.date, "%Y-%m-%d") for cf in req.cashflows]

    rate = xirr(cash_flows, dates)
    return {
        "xirr": round(rate * 100, 2)
    }
