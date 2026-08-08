import { useState } from "react";

const BACKEND_URL = "http://localhost:8000/chat-ai";
const PAYMENT_URL = "http://localhost:8000/payment";
const RESERVE_URL = "http://localhost:8000/reserve";
const ESCALATE_URL = "http://localhost:8000/escalate";
const FOLLOWUP_URL = "http://localhost:8000/followup";
const CUSTOMER_ID = "C001";

type AgentPanel = {
  intent_extracted: { category: string[]; budget: number };
  agent_routing_flow: string[];
  customer_profile: { tier: string; points: number };
};

type Pick = { sku: string; name: string; price_inr: number };

type Message = {
  from: "user" | "bot";
  text: string;
  picks?: Pick[];
  agentPanel?: AgentPanel;
};

export default function SalesGenieChat() {
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Hi, I'm SalesGenie, your AI stylist. What are you shopping for today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function payNow(amount: number) {
    setMessages((m) => [...m, { from: "bot", text: `Processing payment of ₹${amount}...` }]);
    try {
      const res = await fetch(PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: CUSTOMER_ID, amount }),
      });
      const data = await res.json();
      const success = data.status === "success";
      const text = success
        ? `✅ ${data.message} — ₹${data.amount} paid successfully.`
        : `❌ ${data.message}. ${data.recovery ? "Suggestion: " + data.recovery : ""}`;
      setMessages((m) => [...m, { from: "bot", text }]);

      const fRes = await fetch(FOLLOWUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: CUSTOMER_ID,
          channel: "Website",
          payment_success: success,
          purchased_items: [],
        }),
      });
      const fData = await fRes.json();
      setMessages((m) => [...m, { from: "bot", text: fData.message }]);

      if (!success) {
        setMessages((m) => [
          ...m,
          { from: "bot", text: "Need more help? Type 'talk to support' and I'll connect you." },
        ]);
      }
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Payment service unreachable." }]);
    }
  }

  async function reserveForPickup(sku: string) {
    setMessages((m) => [...m, { from: "bot", text: `Reserving item for in-store pickup...` }]);
    try {
      const res = await fetch(RESERVE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: CUSTOMER_ID, sku }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "bot", text: data.confirmation_message }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Reservation service unreachable." }]);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      if (
        userMsg.toLowerCase().includes("talk to support") ||
        userMsg.toLowerCase().includes("human support")
      ) {
        const res = await fetch(ESCALATE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_id: CUSTOMER_ID, issue: "Customer requested human assistance" }),
        });
        const data = await res.json();
        setMessages((m) => [...m, { from: "bot", text: data.message }]);
        setLoading(false);
        return;
      }

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: CUSTOMER_ID, message: userMsg }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text: data.reply,
          picks: data.recommendations,
          agentPanel: data.agent_panel,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Couldn't reach the backend. Is it running on port 8000?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-96 flex-col bg-card">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
            <div
              className={
                "inline-block rounded-2xl px-3 py-2 text-sm max-w-[85%] " +
                (m.from === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground")
              }
            >
              {m.text}
            </div>

            {m.picks?.map((p, idx) => (
              <div
                key={idx}
                className="mt-1 rounded-md border border-border p-2 text-xs text-left flex items-center justify-between gap-2"
              >
                <div>
                  <strong>{p.name}</strong>
                  <br />
                  ₹{p.price_inr}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => payNow(p.price_inr)}
                    className="rounded-full bg-primary px-2 py-1 text-[10px] text-primary-foreground"
                  >
                    Pay now
                  </button>
                  <button
                    onClick={() => reserveForPickup(p.sku)}
                    className="rounded-full border border-primary text-primary px-2 py-1 text-[10px]"
                  >
                    Reserve pickup
                  </button>
                </div>
              </div>
            ))}

            {m.agentPanel && (
              <div className="mt-1 rounded-md border border-dashed border-border p-2 text-[10px] text-left bg-background/50 space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-semibold text-muted-foreground">Agent flow:</span>
                  {m.agentPanel.agent_routing_flow.map((step, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5">
                        {step}
                      </span>
                      {idx < m.agentPanel!.agent_routing_flow.length - 1 && <span>→</span>}
                    </span>
                  ))}
                </div>

                {m.agentPanel.intent_extracted.category?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-semibold text-muted-foreground">Intent:</span>
                    {m.agentPanel.intent_extracted.category.map((c, idx) => (
                      <span key={idx} className="rounded-full bg-secondary px-2 py-0.5">
                        {c}
                      </span>
                    ))}
                    <span className="text-muted-foreground">
                      · budget ₹{m.agentPanel.intent_extracted.budget}
                    </span>
                  </div>
                )}

                <div className="text-muted-foreground">
                  {m.agentPanel.customer_profile.tier} member ·{" "}
                  {m.agentPanel.customer_profile.points} pts
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-muted-foreground">SalesGenie is typing…</div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything about style..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <button
          onClick={sendMessage}
          className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
