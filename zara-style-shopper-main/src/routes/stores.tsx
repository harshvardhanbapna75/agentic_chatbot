import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "Store Availability — ZARA" },
      { name: "description", content: "Find Draped Satin Dress at nearby ZARA stores." },
    ],
  }),
  component: StoresPage,
});

type Stock = "in" | "low" | "out";

const STORES: { name: string; address: string; distance: string; hours: string; stock: Stock; stockLabel: string }[] = [
  { name: "ZARA · Phoenix Palladium", address: "Senapati Bapat Marg, Lower Parel", distance: "1.2 km", hours: "Open until 10 PM", stock: "in", stockLabel: "In Stock" },
  { name: "ZARA · Oberoi Mall", address: "Western Express Highway, Goregaon", distance: "4.8 km", hours: "Open until 9:30 PM", stock: "low", stockLabel: "2 Left" },
  { name: "ZARA · Palladium Chennai", address: "Phoenix Market City, Velachery", distance: "7.3 km", hours: "Open until 10 PM", stock: "in", stockLabel: "In Stock" },
  { name: "ZARA · Infiniti Mall", address: "New Link Road, Andheri West", distance: "9.1 km", hours: "Open until 9 PM", stock: "out", stockLabel: "Out of Stock" },
];

const stockClass: Record<Stock, string> = {
  in: "text-[color:var(--success)]",
  low: "text-[color:var(--warning)]",
  out: "text-[color:var(--danger)]",
};

const dotClass: Record<Stock, string> = {
  in: "bg-[color:var(--success)]",
  low: "bg-[color:var(--warning)]",
  out: "bg-[color:var(--danger)]",
};

function StoresPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[900px] px-4 pb-32 pt-6 sm:px-8">
        <div className="flex items-center justify-between text-xs tracking-[0.25em]">
          <Link to="/" className="flex items-center gap-2 text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em]">STORE AVAILABILITY</h1>
          <button className="text-[11px] tracking-[0.25em] text-muted-foreground">FILTER</button>
        </div>

        {/* product summary */}
        <div className="mt-6 flex gap-4 border-b border-border pb-6">
          <div className="h-24 w-20 shrink-0 bg-beige">
            <div className="mx-auto mt-4 h-12 w-10 bg-beige-deep" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold tracking-wide">DRAPED SATIN DRESS</p>
            <p className="mt-1 text-xs text-muted-foreground">REF · 4729/311</p>
            <p className="mt-2 text-base font-semibold">₹2,790</p>
            <div className="mt-2 inline-block border border-border px-3 py-1 text-xs">SIZE · S</div>
          </div>
        </div>

        {/* map placeholder */}
        <div className="relative mt-6 h-56 overflow-hidden rounded-sm bg-beige">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0,0,0,.06) 25%, rgba(0,0,0,.06) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.06) 75%, rgba(0,0,0,.06) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(0,0,0,.06) 25%, rgba(0,0,0,.06) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.06) 75%, rgba(0,0,0,.06) 76%, transparent 77%)", backgroundSize: "40px 40px" }} />
          {[
            { left: "20%", top: "30%", label: "Palladium" },
            { left: "70%", top: "28%", label: "Infiniti Mall" },
            { left: "45%", top: "55%", label: "Phoenix Mall", active: true },
            { left: "55%", top: "75%", label: "Oberoi Mall" },
          ].map((p) => (
            <div key={p.label} className="absolute -translate-x-1/2 -translate-y-full text-center" style={{ left: p.left, top: p.top }}>
              <MapPin className={`mx-auto h-6 w-6 ${p.active ? "fill-primary text-primary" : "text-foreground/60"}`} />
              <span className="text-[10px] font-medium">{p.label}</span>
            </div>
          ))}
          <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">© Map data</span>
        </div>

        <p className="mt-6 text-[11px] tracking-[0.25em] text-muted-foreground">
          4 STORES NEAR YOU · SIZE S
        </p>

        <ul className="mt-4 divide-y divide-border border-y border-border">
          {STORES.map((s) => (
            <li key={s.name} className="grid grid-cols-[1fr_auto] items-center gap-4 py-5">
              <div className="min-w-0">
                <p className="font-semibold">{s.name}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${dotClass[s.stock]}`} />
                  <span className="truncate">{s.address}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.distance} · {s.hours}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-semibold ${stockClass[s.stock]}`}>{s.stockLabel}</p>
                <button
                  disabled={s.stock === "out"}
                  className="mt-2 border border-primary px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
                >
                  RESERVE
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-0 border-t border-border bg-background md:hidden">
        <button className="h-14 border-r border-border text-[11px] font-semibold tracking-[0.2em]">
          GET DIRECTIONS
        </button>
        <button className="h-14 bg-primary text-[11px] font-semibold tracking-[0.2em] text-primary-foreground">
          RESERVE & TRY
        </button>
      </div>
    </SiteLayout>
  );
}
