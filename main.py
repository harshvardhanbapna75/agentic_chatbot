import os
from fastapi.middleware.cors import CORSMiddleware

print("Current directory:", os.getcwd())
print("Files inside data folder:")

if os.path.exists("data"):
    print(os.listdir("data"))
else:
    print("data folder not found")
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import json
import random
from datetime import datetime

app = FastAPI(
    title="Fashion Journey Intelligence Platform",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


products_df = pd.read_csv(
    "data/products.csv",
    dtype={"sku": str}
)

products_df = products_df.fillna("")
products_df["sku"] = (
    products_df["sku"]
    .astype(str)
    .str.strip()
)

print("Products loaded:", len(products_df))
print("Columns:")
print(products_df.columns.tolist())

with open("data/customers.json", "r") as f:
    customers = json.load(f)

with open("data/inventory.json", "r") as f:
    inventory = json.load(f)

with open("data/loyalty.json", "r") as f:
    loyalty = json.load(f)

with open("data/pos.json", "r") as f:
    pos_data = json.load(f)


class PaymentRequest(BaseModel):
    customer_id: str
    amount: float


class EventRequest(BaseModel):
    customer_id: str
    event_type: str
    channel: str
    sku: str | None = None



@app.get("/")
def home():
    return {
        "message": "Fashion Journey Intelligence Platform Running"
    }


@app.get("/products")
def get_products():

    return (
        products_df
        .fillna("")
        .to_dict(orient="records")
    )


@app.get("/products/{sku}")
def get_product(sku: str):

    sku = sku.strip()

    product = products_df[
        products_df["sku"] == sku
    ]

    if product.empty:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return (
        product
        .fillna("")
        .iloc[0]
        .to_dict()
    )


@app.get("/products/search")
def search_products(
    category: str = None,
    max_price: float = None
):

    results = products_df.copy()

    if category:

        results = results[
            results["Product Category"]
            .astype(str)
            .str.contains(
                category,
                case=False,
                na=False
            )
        ]

    if max_price:

        results = results[
            results["price"] <= max_price
        ]

    return (
        results
        .fillna("")
        .to_dict(orient="records")
    )


@app.get("/skus")
def get_skus():

    return (
        products_df["sku"]
        .head(50)
        .tolist()
    )



@app.get("/customers")
def get_customers():
    return customers


@app.get("/customers/{customer_id}")
def get_customer(customer_id: str):

    for customer in customers:
        if customer["customer_id"] == customer_id:
            return customer

    raise HTTPException(
        status_code=404,
        detail="Customer not found"
    )




@app.get("/inventory")
def get_inventory():
    return inventory


@app.get("/inventory/{sku}")
def get_inventory_by_sku(sku: str):

    if sku not in inventory:
        raise HTTPException(
            status_code=404,
            detail="SKU not found"
        )

    return inventory[sku]


@app.get("/inventory/{sku}/{size}")
def check_stock(
    sku: str,
    size: str
):

    if sku not in inventory:
        raise HTTPException(
            status_code=404,
            detail="SKU not found"
        )

    qty = inventory[sku]["sizes"].get(
        size.upper(),
        0
    )

    return {
        "sku": sku,
        "size": size.upper(),
        "quantity": qty,
        "available": qty > 0
    }




@app.get("/loyalty")
def get_all_loyalty():
    return loyalty


@app.get("/loyalty/{customer_id}")
def get_loyalty(customer_id: str):

    if customer_id not in loyalty:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return loyalty[customer_id]




@app.get("/pos")
def get_pos():
    return pos_data


@app.get("/pos/{customer_id}")
def get_customer_pos(customer_id: str):

    return pos_data.get(
        customer_id,
        []
    )




@app.post("/payment")
def process_payment(
    payment: PaymentRequest
):

    status = random.choice(
        [
            "success",
            "bank_timeout",
            "upi_failure",
            "card_declined"
        ]
    )

    return {
        "customer_id": payment.customer_id,
        "amount": payment.amount,
        "status": status
    }




@app.post("/journey/event")
def record_event(
    event: EventRequest
):

    try:
        with open(
            "data/journey_events.json",
            "r"
        ) as f:
            events = json.load(f)

    except:
        events = []

    new_event = {
        "customer_id": event.customer_id,
        "event_type": event.event_type,
        "channel": event.channel,
        "sku": event.sku,
        "timestamp": str(datetime.now())
    }

    events.append(new_event)

    with open(
        "data/journey_events.json",
        "w"
    ) as f:
        json.dump(
            events,
            f,
            indent=4
        )

    return {
        "message": "Event recorded",
        "event": new_event
    }


@app.get("/journey/{customer_id}")
def get_journey(
    customer_id: str
):

    try:
        with open(
            "data/journey_events.json",
            "r"
        ) as f:
            events = json.load(f)

    except:
        events = []

    customer_events = [
        event
        for event in events
        if event["customer_id"] == customer_id
    ]

    return customer_events

@app.get("/test")
def test():
    return {
        "rows": len(products_df),
        "columns": products_df.columns.tolist()
    }

import re
from pydantic import BaseModel

# --- Worker Agent #1: Intent extraction (deterministic, no LLM needed) ---
OCCASION_KEYWORDS = {
    "wedding": "Wedding Guest",
    "party": "Party",
    "office": "Formal / Office",
    "work": "Formal / Office",
    "casual": "Casual",
    "date": "Date Night",
    "festive": "Festive",
}

CATEGORY_KEYWORDS = {
    "dress": "dress",
    "jeans": "jeans",
    "shirt": "shirt",
    "shoes": "shoes",
    "mule": "shoes",
    "heels": "shoes",
    "cardigan": "cardigan",
    "top": "top",
    "jacket": "jacket",
}


def extract_intent(message: str) -> dict:
    msg = message.lower()

    occasion = next(
        (v for k, v in OCCASION_KEYWORDS.items() if k in msg),
        "General"
    )
    category = next(
        (v for k, v in CATEGORY_KEYWORDS.items() if k in msg),
        None
    )

    # pull the first 3-6 digit number in the message as budget
    budget_match = re.search(r"(\d{3,6})", msg.replace(",", ""))
    budget = int(budget_match.group(1)) if budget_match else 5000

    formality = "Elegant, Semi-formal" if occasion in (
        "Wedding Guest", "Party", "Festive"
    ) else "Casual"

    return {
        "occasion": occasion,
        "category": category,
        "budget": budget,
        "formality": formality,
    }


# --- Worker Agent #2: Recommendation (reuses your recommendation_agent.py logic) ---
def recommend(category: str | None, budget: int) -> list:
    if category:
        mask = (
            products_df["name"].str.contains(category, case=False, na=False)
            | products_df["terms"].str.contains(category, case=False, na=False)
            | products_df["Product Category"].str.contains(category, case=False, na=False)
        )
        results = products_df[mask & (products_df["price"] * 85 <= budget)]
    else:
        results = products_df[products_df["price"] * 85 <= budget]

    picks = []
    for _, row in results.iterrows():
        sku = row["sku"]
        stock_info = inventory.get(sku, {}).get("sizes", {})
        total_stock = sum(stock_info.values()) if stock_info else 0
        if total_stock > 0:
            picks.append({
                "sku": sku,
                "name": row["name"],
                "price_inr": round(row["price"] * 85),
                "stock": total_stock,
            })
    return picks[:3]


# --- Worker Agent #3: Loyalty / customer profile lookup ---
def get_profile(customer_id: str) -> dict:
    for entry in loyalty:
        if entry.get("customer_id") == customer_id:
            return entry
    return {"tier": "Standard", "points": 0}

# --- Request model ---
class ChatRequest(BaseModel):
    customer_id: str
    message: str


# --- The orchestrator endpoint ---
@app.post("/chat")
def chat(req: ChatRequest):
    intent = extract_intent(req.message)
    picks = recommend(intent["category"], intent["budget"])
    profile = get_profile(req.customer_id)

    # record this as a journey event too, so journey_intelligence.py has data
    try:
        with open("data/journey_events.json", "r") as f:
            events = json.load(f)
    except Exception:
        events = []
    events.append({
        "customer_id": req.customer_id,
        "event_type": "chat_query",
        "channel": "web_chat",
        "sku": picks[0]["sku"] if picks else None,
    })
    with open("data/journey_events.json", "w") as f:
        json.dump(events, f, indent=4)

    if picks:
        reply = (
            f"I found {len(picks)} pieces for your "
            f"{intent['occasion'].lower()} look, under "
            f"₹{intent['budget']}."
        )
    else:
        reply = (
            "I couldn't find an exact match in stock for that — "
            "want me to widen the budget or try a different category?"
        )

    return {
        "reply": reply,
        "agent_panel": {
            "intent_extracted": intent,
            "agent_routing_flow": [
                "Sales Agent", "Recommend", "Inventory", "Pricing"
            ],
            "customer_profile": profile,
        },
        "recommendations": picks,
    }


