import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Store, Package } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — ZARA" },
      { name: "description", content: "Review your bag and proceed to payment." },
    ],
  }),
  component: CartPage,
});

const ITEMS = [
  { idx: "01", name: "DRAPED SATIN DRESS", ref: "4729/311", size: "S", color: "Ecru", price: 2790, swatch: "var(--beige-deep)" },
  { idx: "02", name: "KNIT CARDIGAN", ref: "3821/100", size: "S", color: "Sage", price: 1990, swatch: "#b7c9b1" },
];

function CartPage() {
  const [promo, setPromo] = useState("WINTER15");
  const [applied, setApplied] = useState(true);
  const [fulfillment, setFulfillment] = useState<"home" | "click" | "reserve">("home");

  const subtotal = ITEMS.reduce((s, i) => s + i.price, 0);
  const discount = applied ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discount;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-6 sm:px-8">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <h1 className="font-display text-3xl">Your Bag</h1>
          <span className="text-[11px] tracking-[0.25em] text-muted-foreground">{ITEMS.length} ITEMS</span>
        </div>

        <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-[1fr_360px]">
          <div>
            <ul className="divide-y divide-border">
              {ITEMS.map((it) => (
                <li key={it.idx} className="grid grid-cols-[80px_1fr] gap-4 py-6 sm:grid-cols-[120px_1fr]">
                  <div className="relative h-28 bg-beige sm:h-36">
                    <span className="absolute left-2 top-2 text-[10px] text-muted-foreground">{it.idx}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-14 w-10 sm:h-20 sm:w-14" style={{ backgroundColor: it.swatch }} />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold tracking-wide">{it.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">REF · {it.ref}</p>
                        <p className="mt-2 text-xs">
                          Size <span className="font-semibold">{it.size}</span>
                          <span className="mx-2 text-muted-foreground">·</span>
                          Colour <span className="font-semibold">{it.color}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <p className="text-lg font-semibold">₹{it.price.toLocaleString("en-IN")}</p>
                      <div className="text-[11px] tracking-[0.15em]">
                        <button className="text-muted-foreground hover:text-foreground">SAVE</button>
                        <button className="ml-2 underline">REMOVE</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* loyalty */}
            <div className="mt-4 flex items-center justify-between gap-4 border border-border bg-cream p-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <div className="text-xs">
                  <p className="font-semibold tracking-[0.15em]">SILVER MEMBER · RIYA</p>
                  <p className="text-muted-foreground">Points earned on this order</p>
                </div>
              </div>
              <span className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                +478 pts
              </span>
            </div>

            {/* promo */}
            <div className="mt-4 flex items-stretch border border-border">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                placeholder="Promo code"
                className="flex-1 bg-transparent px-4 text-sm font-semibold tracking-wider outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setApplied(true)}
                className="bg-primary px-5 py-3 text-xs font-semibold tracking-[0.2em] text-primary-foreground"
              >
                {applied ? "APPLIED ✓" : "APPLY"}
              </button>
            </div>
          </div>

          {/* summary */}
          <aside className="space-y-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>₹{subtotal.toLocaleString("en-IN")}</dd>
              </div>
              {applied && (
                <div className="flex justify-between text-[color:var(--success)]">
                  <dt>Discount ({promo})</dt>
                  <dd>-₹{discount.toLocaleString("en-IN")}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Delivery</dt>
                <dd>Free</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>₹{total.toLocaleString("en-IN")}</dd>
              </div>
            </dl>

            <div>
              <p className="text-[11px] tracking-[0.25em] text-muted-foreground">FULFILLMENT</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { id: "home" as const, icon: Home, label: "HOME DELIVERY", sub: "2-4 days" },
                  { id: "click" as const, icon: Store, label: "CLICK & COLLECT", sub: "Ready today" },
                  { id: "reserve" as const, icon: Package, label: "RESERVE & TRY", sub: "Book a slot" },
                ].map((f) => {
                  const Icon = f.icon;
                  const active = fulfillment === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFulfillment(f.id)}
                      className={`flex flex-col items-center gap-2 border p-3 text-center text-[10px] leading-tight transition-colors ${
                        active ? "border-primary" : "border-border hover:border-primary/60"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold tracking-[0.1em]">{f.label}</span>
                      <span className="text-muted-foreground">{f.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 text-xs tracking-[0.2em] text-muted-foreground">
              <span>TOTAL DUE</span>
              <span className="text-base font-semibold text-foreground">₹{total.toLocaleString("en-IN")}</span>
            </div>

            <Link
              to="/order"
              className="flex h-14 items-center justify-center bg-primary text-xs font-semibold tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              PROCEED TO PAYMENT
            </Link>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
