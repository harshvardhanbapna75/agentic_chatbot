import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: "Order Placed — ZARA" },
      { name: "description", content: "Your order is confirmed. Track delivery in real time." },
    ],
  }),
  component: OrderPage,
});

type Step = { label: string; sub: string; status: "done" | "current" | "upcoming" };

const TIMELINE: Step[] = [
  { label: "Order Confirmed", sub: "Payment received · ₹4,063 · Today, 9:41 AM", status: "done" },
  { label: "Being Packed", sub: "Fulfillment Center, Mumbai · Today, 2:00 PM", status: "done" },
  { label: "Dispatched", sub: "BlueDart Express · Tracking available · Tomorrow, ~10 AM", status: "current" },
  { label: "Out for Delivery", sub: "Thu 3 July", status: "upcoming" },
  { label: "Delivered", sub: "Est. Fri 5 July", status: "upcoming" },
];

const ITEMS = [
  { name: "DRAPED SATIN DRESS", meta: "Size S · Ecru", price: 2373, swatch: "var(--beige-deep)" },
  { name: "KNIT CARDIGAN", meta: "Size S · Sage", price: 1690, swatch: "#b7c9b1" },
];

function OrderPage() {
  return (
    <SiteLayout>
      {/* Hero confirmed banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-6 px-4 py-10 sm:px-8 md:grid-cols-[80px_1fr_auto] md:items-center md:py-14">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground text-primary">
            <Check className="h-7 w-7" strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-4xl md:text-5xl">Order Placed.</h1>
            <p className="mt-1 font-display text-2xl opacity-90 md:text-3xl">Thank you, Riya.</p>
            <p className="mt-3 text-sm opacity-80">Estimated delivery: Thu 3 — Sat 5 July</p>
            <p className="mt-1 text-[11px] tracking-[0.2em] opacity-60">
              ORDER · #ZR-IN-20260628-7841
            </p>
          </div>
          <span className="justify-self-start border border-primary-foreground/40 px-3 py-1.5 text-[10px] tracking-[0.25em] md:justify-self-end">
            CONFIRMED ✓
          </span>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_380px]">
        {/* Timeline */}
        <div>
          <p className="text-[11px] tracking-[0.25em] text-muted-foreground">LIVE TRACKING</p>
          <ol className="mt-6 space-y-6">
            {TIMELINE.map((step, i) => (
              <li key={step.label} className="relative grid grid-cols-[24px_1fr] gap-4">
                {i < TIMELINE.length - 1 && (
                  <span className="absolute left-[11px] top-6 h-full w-px bg-border" />
                )}
                <span
                  className={`relative z-10 mt-1 h-6 w-6 rounded-full border-2 ${
                    step.status === "done"
                      ? "border-primary bg-primary"
                      : step.status === "current"
                      ? "border-primary bg-background"
                      : "border-border bg-background"
                  }`}
                >
                  {step.status === "done" && (
                    <Check className="absolute inset-0 m-auto h-3 w-3 text-primary-foreground" strokeWidth={3} />
                  )}
                </span>
                <div className={step.status === "upcoming" ? "opacity-40" : ""}>
                  <p className="font-semibold">{step.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Summary */}
        <aside>
          <p className="text-[11px] tracking-[0.25em] text-muted-foreground">
            {ITEMS.length} ITEMS · ₹{ITEMS.reduce((s, i) => s + i.price, 0).toLocaleString("en-IN")}
          </p>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {ITEMS.map((it) => (
              <li key={it.name} className="grid grid-cols-[80px_1fr_auto] items-center gap-4 py-4">
                <div className="flex h-20 items-center justify-center bg-beige">
                  <div className="h-12 w-8" style={{ backgroundColor: it.swatch }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{it.meta}</p>
                </div>
                <p className="text-sm font-semibold">₹{it.price.toLocaleString("en-IN")}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 border border-border p-4">
            <p className="text-[11px] tracking-[0.2em] text-muted-foreground">SHIPPING ADDRESS</p>
            <p className="mt-2 text-sm">Riya Sharma</p>
            <p className="text-sm text-muted-foreground">42, Sector 14, DLF Phase 1</p>
            <p className="text-sm text-muted-foreground">Gurugram, Haryana · 122 002</p>
          </div>

          <div className="mt-4 flex items-center justify-between bg-primary px-4 py-4 text-primary-foreground">
            <div>
              <p className="text-[10px] tracking-[0.25em] opacity-70">POINTS EARNED</p>
              <p className="font-display text-xl">+688 pts</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.25em] opacity-70">NEW BALANCE</p>
              <p className="font-display text-xl">3,528 pts</p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-6 flex h-12 items-center justify-center border border-primary text-xs font-semibold tracking-[0.25em] transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            CONTINUE SHOPPING
          </Link>
        </aside>
      </div>
    </SiteLayout>
  );
}
