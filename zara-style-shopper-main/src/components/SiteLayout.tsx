import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, User, MessageCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import SalesGenieChat from "./SalesGenieChat";

const NAV = [
  { label: "WOMAN", to: "/" as const },
  { label: "MAN", to: "/" as const },
  { label: "KIDS", to: "/" as const },
  { label: "BEAUTY", to: "/" as const },
  { label: "HOME", to: "/" as const },
  { label: "SALE", to: "/" as const },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cartCount = 2;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-8">
          <Link to="/" className="font-display text-2xl font-semibold tracking-[0.25em]">
            ZARA
          </Link>
          <nav className="hidden justify-center gap-8 text-xs font-medium tracking-[0.15em] md:flex">
            {NAV.map((n, i) => (
              <Link
                key={i}
                to={n.to}
                className={`transition-colors hover:text-foreground ${
                  pathname === "/" && i === 0 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-foreground">
            <button aria-label="Search"><Search className="h-4 w-4" /></button>
            <button aria-label="Wishlist" className="hidden sm:block"><Heart className="h-4 w-4" /></button>
            <Link to="/cart" className="relative flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-xs font-medium">({cartCount})</span>
            </Link>
            <button aria-label="Account" className="hidden sm:block"><User className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-border bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-10 text-xs tracking-[0.15em] text-muted-foreground sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-display text-lg tracking-[0.25em] text-foreground">ZARA</span>
            <span>© 2026 INDUSTRIA DE DISEÑO TEXTIL, S.A.</span>
          </div>
        </div>
      </footer>

      <AiChatButton />
    </div>
  );
}

function AiChatButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Stylist chat"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(360px,calc(100vw-3rem))] overflow-hidden rounded-md border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="text-[10px] tracking-[0.2em] opacity-70">ZARA AI</p>
              <p className="font-display text-base">Style Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs opacity-70 hover:opacity-100">CLOSE</button>
          </div>
          <SalesGenieChat />
        </div>
      )}
    </>
  );
}
