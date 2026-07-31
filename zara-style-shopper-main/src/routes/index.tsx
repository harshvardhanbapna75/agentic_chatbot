import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ChevronLeft, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Draped Satin Dress — ZARA" },
      { name: "description", content: "Draped satin midi dress in ecru. Winter '26 collection." },
    ],
  }),
  component: ProductPage,
});

const COLORS = [
  { name: "Ecru", hex: "#c9b89a", active: true },
  { name: "Stone", hex: "#9a9694" },
  { name: "Mist", hex: "#c9c8d4" },
  { name: "Sage", hex: "#b7c9b1" },
];

const SIZES = [
  { label: "XS", disabled: true },
  { label: "S" },
  { label: "M" },
  { label: "L", disabled: true },
  { label: "XL" },
];

function ProductPage() {
  const [size, setSize] = useState("S");
  const [color, setColor] = useState("Ecru");

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-0 sm:px-8">
        {/* Breadcrumb desktop */}
        <div className="hidden px-2 pt-6 text-[11px] tracking-[0.2em] text-muted-foreground md:block">
          <Link to="/" className="hover:text-foreground">WOMAN</Link>
          <span className="mx-2">/</span>
          <span>DRESSES</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">DRAPED SATIN DRESS</span>
        </div>

        <div className="grid grid-cols-1 gap-0 md:grid-cols-[1fr_420px] md:gap-12 md:py-6">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[3/4] bg-beige md:aspect-[4/5]">
              {/* mobile top controls */}
              <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between md:hidden">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="rounded-sm bg-primary px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-primary-foreground">
                  NEW SEASON
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[55%] w-[35%] rounded-sm bg-beige-deep shadow-inner" />
              </div>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                <span className="h-1 w-6 rounded-full bg-primary" />
                <span className="h-1 w-1.5 rounded-full bg-primary/30" />
                <span className="h-1 w-1.5 rounded-full bg-primary/30" />
                <span className="h-1 w-1.5 rounded-full bg-primary/30" />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="px-5 pb-32 pt-6 md:pb-10 md:pt-2">
            <p className="text-[11px] tracking-[0.25em] text-muted-foreground">
              WOMAN · WINTER '26
            </p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl">Draped Satin Dress</h1>
            <p className="mt-2 text-lg font-semibold">₹2,790</p>

            <div className="mt-7">
              <p className="text-[11px] tracking-[0.25em] text-muted-foreground">COLOUR</p>
              <div className="mt-3 flex items-center gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    className={`relative h-7 w-7 rounded-full border ${
                      color === c.name ? "ring-1 ring-offset-2 ring-primary" : "border-border"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{color} · 4 Colours Available</p>
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-[11px] tracking-[0.25em] text-muted-foreground">SELECT SIZE</p>
                <button className="text-[11px] tracking-[0.15em] text-muted-foreground underline">
                  Size guide
                </button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.label}
                    disabled={s.disabled}
                    onClick={() => setSize(s.label)}
                    className={`h-11 border text-sm transition-colors ${
                      s.disabled
                        ? "cursor-not-allowed border-border text-muted-foreground/50 line-through"
                        : size === s.label
                        ? "border-primary bg-background font-semibold"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Stylist */}
            <div className="mt-7 flex gap-3 rounded-sm border border-border bg-cream p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold tracking-wider text-primary-foreground">
                ZA
              </div>
              <p className="text-xs leading-relaxed text-foreground">
                <span className="font-semibold">AI Stylist says: </span>
                Pairs perfectly with the Knit Cardigan in Sage for your winter wedding.{" "}
                <Link to="/cart" className="inline-flex items-center gap-1 font-semibold underline">
                  SHOP LOOK <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </div>

            {/* desktop actions */}
            <div className="mt-8 hidden gap-3 md:flex">
              <button className="flex h-12 w-12 items-center justify-center border border-border">
                <Heart className="h-4 w-4" />
              </button>
              <Link
                to="/stores"
                className="flex h-12 flex-1 items-center justify-center border border-primary text-xs font-semibold tracking-[0.2em] transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                CHECK STORES
              </Link>
              <Link
                to="/cart"
                className="flex h-12 flex-1 items-center justify-center bg-primary text-xs font-semibold tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                + ADD TO BAG
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-background p-3 md:hidden">
        <button className="flex h-12 w-12 items-center justify-center border border-border">
          <Heart className="h-4 w-4" />
        </button>
        <Link
          to="/stores"
          className="flex h-12 flex-1 items-center justify-center border border-primary text-[11px] font-semibold tracking-[0.2em]"
        >
          CHECK STORES
        </Link>
        <Link
          to="/cart"
          className="flex h-12 flex-1 items-center justify-center bg-primary text-[11px] font-semibold tracking-[0.2em] text-primary-foreground"
        >
          + ADD TO BAG
        </Link>
      </div>
    </SiteLayout>
  );
}
