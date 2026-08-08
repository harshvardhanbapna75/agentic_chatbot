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
def process_payment(payment: PaymentRequest):
    return payment_agent.process_payment(payment.customer_id, payment.amount)

class ReservationRequest(BaseModel):
    customer_id: str
    sku: str


@app.post("/reserve")
def reserve_product(req: ReservationRequest):
    return store_agent.reserve_product(req.customer_id, req.sku)


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


# ============================================================
# GROQ LLM + SUPABASE — Real AI Chat Endpoint
# ============================================================
from groq import Groq
from payment_agent import PaymentAgent

payment_agent = PaymentAgent()
from store_reservation_agent import StoreReservationAgent

store_agent = StoreReservationAgent()
from supabase import create_client as supabase_create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://fzpubtkvsrzvjsisjwyg.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_secret_rqQWCUFzGeTfbZvtzUU4vw_2o6tImki")
GROQ_KEY = os.environ.get("GROQ_API_KEY", "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")

sb = supabase_create_client(SUPABASE_URL, SUPABASE_KEY)
groq_client = Groq(api_key=GROQ_KEY)

class AIChatRequest(BaseModel):
    customer_id: str
    message: str


ALLOWED_CATEGORIES = ["dress", "jacket", "coat", "blazer", "jeans", "pants",
                       "shirt", "top", "sweater", "cardigan", "hoodie",
                       "shoes", "suit", "skirt", "shorts"]


def extract_categories_llm(message: str) -> list:
    try:
        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": (
                    "You extract clothing categories from a shopper's message. "
                    f"Only use categories from this exact list: {ALLOWED_CATEGORIES}. "
                    "Map synonyms sensibly (boots/sneakers/heels/mules -> shoes, "
                    "trousers/chinos -> pants, overshirt -> shirt, etc). "
                    "If the message is generic (e.g. 'what should I wear today', "
                    "mentions weather/occasion but no specific item), pick 1-3 "
                    "categories that would make sense as a full outfit. "
                    "Respond with ONLY a JSON array of strings, nothing else. "
                    "Example: [\"shoes\", \"jeans\"]"
                )},
                {"role": "user", "content": message}
            ],
            max_tokens=100,
            temperature=0.3
        )
        raw = resp.choices[0].message.content.strip()
        parsed = json.loads(raw)
        return [c for c in parsed if c in ALLOWED_CATEGORIES]
    except Exception:
        msg_lower = message.lower()
        return [c for c in ALLOWED_CATEGORIES if c in msg_lower]


# --- Session state — isse hi cross-channel continuity milegi ---
def get_session(customer_id: str) -> dict:
    try:
        result = sb.table("sessions").select("*").eq("customer_id", customer_id).execute()
        if result.data:
            return result.data[0]
    except Exception:
        pass
    return {
        "customer_id": customer_id,
        "chat_history": [],
        "last_recommendations": [],
        "last_category": [],
    }


def save_session(customer_id: str, chat_history: list, last_recommendations: list, last_category: list):
    try:
        sb.table("sessions").upsert({
            "customer_id": customer_id,
            "chat_history": chat_history[-20:],
            "last_recommendations": last_recommendations,
            "last_category": last_category,
        }).execute()
    except Exception:
        pass


def handle_chat(customer_id: str, message: str):
    msg = message.lower()

    # Pichli session state uthao — yehi cross-channel continuity ka core hai
    session = get_session(customer_id)
    chat_history = session.get("chat_history") or []

    # Budget extract karo
    budget_match = re.search(r"(\d{3,6})", msg.replace(",", ""))
    budget_usd = int(budget_match.group(1)) / 85 if budget_match else 100

    matched_categories = extract_categories_llm(message)

    # Agar naye message mein koi category nahi mili, to pichli baar wali continue karo
    if not matched_categories and session.get("last_category"):
        matched_categories = session["last_category"]
    
    # Casual chit-chat (jaise "hiiii", "hello") ko product search mat samjho —
    # nahi to ye session ka last_recommendations overwrite karke asli data ganwa dega
    greeting_words = ["hi", "hii", "hiii", "hiiii", "hello", "hey", "heyy", "yo", "sup"]
    is_generic_chat = (not matched_categories) and (msg.strip(" !.?") in greeting_words)

    # "Pehle kya recommend kiya tha" type sawal detect karo
    recall_keywords = [
        "did you recommend", "you recommended", "on website", "on the website",
        "earlier", "before", "last time", "you suggested", "you showed", "previously"
    ]
    is_recall_question = any(k in msg for k in recall_keywords)

    if is_generic_chat:
        items = []
    elif is_recall_question and session.get("last_recommendations"):
        items = session["last_recommendations"]
    else:
        try:
            query = sb.table("products").select("name,description,price,category,terms").lte("price", budget_usd)
            pool = query.limit(80).execute().data

            if matched_categories:
                candidates = [
                    p for p in pool
                    if any(cat in ((p.get("name") or "") + (p.get("terms") or "")).lower() for cat in matched_categories)
                ]
                if not candidates:
                    candidates = pool
            else:
                candidates = pool

            random.shuffle(candidates)

            seen_types = {}
            items = []
            for p in candidates:
                rough_type = (p.get("name") or "unknown").split()[-1].lower()
                if seen_types.get(rough_type, 0) >= 2:
                    continue
                seen_types[rough_type] = seen_types.get(rough_type, 0) + 1
                items.append(p)
                if len(items) >= 5:
                    break

            if not items:
                items = candidates[:5]

        except Exception:
            items = []

    # Customer loyalty info
    try:
        loyalty_result = sb.table("loyalty").select("tier,points").eq("customer_id", customer_id).execute()
        loyalty_info = loyalty_result.data[0] if loyalty_result.data else {"tier": "Standard", "points": 0}
    except Exception:
        loyalty_info = {"tier": "Standard", "points": 0}

    # Products ko readable text mein convert karo
    if items:
        products_text = "\n".join([
            f"- {p['name']}: ₹{int(float(p['price'])*85)} — {(p.get('description') or '')[:80]}"
            for p in items
        ])
    else:
        products_text = "No exact matches found in current inventory."

    system_prompt = f"""You are SalesGenie, a friendly and stylish AI fashion assistant for a premium retail store (like Zara).
You help customers find perfect outfits with warmth, personality, and expertise.
The customer is a {loyalty_info['tier']} member with {loyalty_info['points']} loyalty points.
This conversation may continue across different channels (website, Telegram, etc.) for the same
customer — treat it as one continuous conversation and use the prior messages below for context.

Current inventory matches for their query:
{products_text}

Guidelines:
- Be conversational, warm, and enthusiastic like a personal stylist
- If products are available, recommend them naturally with styling tips
- Mention loyalty points/tier when relevant
- If no products match, suggest alternatives or ask clarifying questions
- If the customer refers to something discussed earlier, use the conversation history to understand it
- Keep responses concise but helpful (2-4 sentences)
- Never sound robotic or generic
- CRITICAL: When mentioning product names, use ONLY the exact names listed above in "Current inventory matches" — never invent, rename, or alter a product name"""

    try:
        llm_messages = [{"role": "system", "content": system_prompt}]
        llm_messages += chat_history[-8:]
        llm_messages.append({"role": "user", "content": message})

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=llm_messages,
            max_tokens=300,
            temperature=0.7
        )
        ai_reply = response.choices[0].message.content
    except Exception as e:
        ai_reply = f"I'm having trouble connecting right now. Please try again! (Error: {str(e)})"

    recommendations = [
        {"sku": p.get("sku", ""), "name": p["name"], "price_inr": int(float(p["price"]) * 85)}
        for p in items
    ]

    # Session ko update karke save karo — agli baar chahe wo Telegram se aaye ya web se, yaad rahega
    chat_history.append({"role": "user", "content": message})
    chat_history.append({"role": "assistant", "content": ai_reply})

    # Casual chit-chat ke baad purana recommendations/category safe rakho, overwrite mat karo
    if is_generic_chat:
        save_session(customer_id, chat_history, session.get("last_recommendations") or [], session.get("last_category") or [])
    else:
        save_session(customer_id, chat_history, items, matched_categories)

    return {
        "reply": ai_reply,
        "recommendations": recommendations,
        "agent_panel": {
            "intent_extracted": {"category": matched_categories, "budget": int(budget_usd * 85)},
            "agent_routing_flow": ["Sales Agent", "Supabase DB", "Groq LLaMA 3.3", "Response"],
            "customer_profile": loyalty_info
        }
    }


@app.post("/chat-ai")
def chat_ai_endpoint(req: AIChatRequest):
    return handle_chat(req.customer_id, req.message)