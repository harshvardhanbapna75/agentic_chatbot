import json
import csv
import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL") or "https://fzpubtkvsrzvjsisjwyg.supabase.co"
key = os.environ.get("SUPABASE_KEY") or "sb_secret_rqQWCUFzGeTfbZvtzUU4vw_2o6tImki"

supabase = create_client(url, key)


print("Uploading products...")
with open("data/products.csv", "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    products = []
    for row in reader:
        products.append({
            "sku": row["sku"],
            "name": row["name"],
            "description": row["description"],
            "price": float(row["price"]) if row["price"] else 0,
            "category": row.get("Product Category", ""),
            "terms": row.get("terms", ""),
            "section": row.get("section", ""),
            "promotion": row.get("Promotion", ""),
            "sales_volume": int(row.get("Sales Volume", 0)) if row.get("Sales Volume") else 0
        })
    
    for i in range(0, len(products), 50):
        batch = products[i:i+50]
        supabase.table("products").upsert(batch).execute()
        print(f"  Uploaded products {i+1} to {i+len(batch)}")

print("Uploading customers...")
with open("data/customers.json", "r") as f:
    customers = json.load(f)
    for c in customers:
        supabase.table("customers").upsert({
            "customer_id": c.get("customer_id", ""),
            "name": c.get("name", ""),
            "email": c.get("email", ""),
            "preferred_size": c.get("preferred_size", ""),
            "preferred_categories": str(c.get("preferred_categories", ""))
        }).execute()
print("  Customers uploaded!")

print("Uploading loyalty...")
with open("data/loyalty.json", "r") as f:
    loyalty = json.load(f)
    for entry in loyalty:
        supabase.table("loyalty").upsert({
            "customer_id": entry.get("customer_id", ""),
            "tier": entry.get("tier", ""),
            "points": entry.get("points", 0),
            "rewards_available": str(entry.get("rewards_available", []))
        }).execute()
print("  Loyalty uploaded!")

print("Uploading inventory...")
with open("data/inventory.json", "r") as f:
    inventory = json.load(f)
    for sku, data in inventory.items():
        supabase.table("inventory").upsert({
            "sku": sku,
            "sizes": data.get("sizes", {})
        }).execute()
print("  Inventory uploaded!")

print("\nSab kuch upload ho gaya Supabase mein!")