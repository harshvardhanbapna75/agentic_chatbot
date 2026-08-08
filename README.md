# Sales Genie 🛍️
### Agentic AI-Powered Omnichannel Retail Sales Platform
**IITISoC 2025 — IIT Indore**

---

## Overview

Sales Genie is an agentic AI-powered conversational retail sales platform that operates seamlessly across multiple channels — mobile app, WhatsApp, and in-store kiosk. A central Sales Agent orchestrates 8 specialized worker agents for personalized product discovery, inventory management, payment processing, cart monitoring, and post-purchase follow-up — maintaining full context continuity across channel switches.

---

## Agent Architecture
Customer Query
↓
SalesAgent (Orchestrator)
↓
┌─────────────────────────────────────┐
│ StylingAgent → style detection │
│ RecommendationAgent → products │
│ InventoryAgent → stock check │
│ PaymentAgent → process/fail │
│ HumanSupportAgent → escalate │
│ StoreReservationAgent → book slot │
│ FollowUpAgent → post purchase │
│ CartMonitoringAgent → abandonment │
└─────────────────────────────────────┘
↓
SessionManager (cross-channel context)
↓
AgentLogger (real-time observability)

---

## Tech Stack

| Component | Technology |
|---|---|
| Orchestration | LangGraph StateGraph |
| LLM | Groq (llama-3.3-70b-versatile) |
| Embeddings | all-MiniLM-L6-v2 |
| Vector DB | ChromaDB (persistent) |
| Keyword Search | TF-IDF + Cosine Similarity |
| Session Store | JSON (Redis in production) |
| Observability | agent_logger.py |


---

## Project Structure

├── data/
│ ├── customers.json # 10 synthetic customer profiles
│ ├── products.csv # 228 product SKUs
│ ├── inventory.json # Stock levels by size
│ ├── loyalty.json # Loyalty points and offers
│ ├── journey_events.json # Customer purchase history
│ ├── customer_memories.json # Customer memory store
│ └── pos.json # Cart data
├── sales_agent.py # Central orchestrator
├── styling_agent.py # Style detection
├── recommendation_agent.py # Hybrid search + recommendations
├── inventory_agent.py # Stock checking
├── payment_agent.py # Payment processing
├── store_reservation_agent.py # In-store booking
├── followup_agent.py # Post-purchase messages
├── human_support_agent.py # Escalation handling
├── cart_monitoring_agent.py # Cart tracking + abandonment
├── session_manager.py # Cross-channel state
├── semantic_search.py # ChromaDB + MiniLM search
├── agent_logger.py # Observability logging
├── preference_layer.py # Customer preferences
├── journey_intelligence.py # Customer profiling
├── langgraph_agent.py # LangGraph orchestration
├── embedding_agent.py # Embedding utilities
├── memory_generator.py # Memory generation
├── test_journey_1.py # Mobile app journey
├── test_journey_2.py # WhatsApp to store journey
├── test_journey_3.py # Kiosk to mobile journey
└── README.md


---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Rishika-netizen/agentic-ai.git
cd agentic-ai
```

### 2. Create virtual environment
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install sentence-transformers scikit-learn pandas
pip install chromadb langgraph groq python-dotenv
pip install streamlit
```

### 4. Set up environment variables
Create a `.env` file in the project root:

GROQ_API_KEY=your_groq_api_key_here

Get your free Groq API key at: https://console.groq.com

### 5. Set up offline mode for embeddings
The MiniLM model downloads automatically on first run.
After first download, add these lines at the top of
`semantic_search.py` to run offline:
```python
import os
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
```

---

## How to Run

### Run the 3 customer journeys:
```bash
# Journey 1 — Mobile App: Discovery to Purchase
python test_journey_1.py

# Journey 2 — WhatsApp to In-Store Reserve
python test_journey_2.py

# Journey 3 — Kiosk to Mobile Follow-Up
python test_journey_3.py
```

### Run LangGraph version:
```bash
python langgraph_agent.py
```

### Run Streamlit demo:
```bash
streamlit run streamlit_app.py
```

---

## Customer Journeys

### Journey 1 — Mobile App

Customer types query on mobile
↓
StylingAgent detects style
↓
RecommendationAgent finds products
↓
InventoryAgent confirms stock
↓
PaymentAgent processes payment
↓
Success → order confirmed
Failure → HumanSupportAgent escalates


### Journey 2 — WhatsApp to In-Store

Customer chats on WhatsApp
↓
Recommendations generated
↓
Customer wants to try in store
↓
StoreReservationAgent books slot
↓
Channel switch → In-Store
Context fully preserved


### Journey 3 — Kiosk to Mobile

Customer browses at kiosk
↓
Payment attempted → fails
↓
HumanSupportAgent escalates
↓
Channel switch: Kiosk → Mobile App
previous_channel preserved in session
↓
FollowUpAgent sends recovery message
on mobile with full context


---

## Key Design Decisions

**Why MiniLM over RAG?**
Intent classification is a closed-set problem.
Embedding similarity is faster, cheaper and more
accurate than RAG for routing to fixed intents.

**Why Hybrid TF-IDF + Semantic Search?**
Semantic search understands meaning but misses
exact keywords. TF-IDF catches exact matches.
Together they provide better coverage.

**Why LLM only in some agents?**
Payment and inventory are deterministic — LLM adds
no value there. LLM is used only where natural
language generation improves the experience:
recommendations, messages, and confirmations.

**Why file-based sessions?**
Human-readable for demo and debugging. In production
this would be Redis for distributed session management.

---

## Failure Handling

| Failure | Recovery |
|---|---|
| UPI failure | Suggests credit/debit card |
| Bank timeout | Suggests retry after few minutes |
| Groq API down | Hardcoded fallback messages |
| Low style confidence | LLM classification fallback |
| No recommendations | Query-only fallback |
| New customer | Skips preference filtering |
| Out of stock | Filtered from results |
| Cart abandonment | Groq reminder message |

---

## Synthetic Data

| File | Contents |
|---|---|
| customers.json | 10 customer profiles |
| products.csv | 228 SKUs across 4-5 categories |
| inventory.json | Stock levels by size per SKU |
| loyalty.json | Points and promotional offers |
| journey_events.json | Purchase and dislike history |

---

## AI Tools Used

- **Claude (Anthropic)** — architecture review, debugging
- **ChatGPT (OpenAI)** — initial code generation
- **Groq (llama-3.3-70b-versatile)** — LLM reasoning within agents
- **all-MiniLM-L6-v2** — semantic embedding model
- **ChromaDB** — vector storage and retrieval

---

## Bonus Deliverables Covered

- ✓ Agent observability dashboard via agent_logger.py
- ✓ Modular agent extensibility via LangGraph nodes
- ✓ Cart monitoring and abandonment detection

---

## Deliverables Checklist

- ✓ Sales Agent + 8 Worker Agents
- ✓ LangGraph orchestration
- ✓ Session state across 2+ channel switches
- ✓ Graceful failure recovery
- ✓ 3 complete end-to-end journeys
- ✓ Synthetic data (228 products, 10 customers)
- ✓ Private GitHub repository
- ✓ Clean commented code
- ✓ README
- ✓ Agent role specification document
