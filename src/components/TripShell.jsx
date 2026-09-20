import { Link } from "@tanstack/react-router";
import { Mountain } from "lucide-react";

export function Brand({ className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-semibold text-foreground ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Mountain className="h-4 w-4" />
      </span>
      TripSync
    </Link>
  );
}

export function TopBar({ right = null }) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Brand />
        <div className="flex items-center gap-3 text-sm text-muted-foreground">{right}</div>
      </div>
    </header>
  );
}

export function Card({ className = "", children }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Bar({ value, total, tone = "primary" }) {
  const pct = total ? (value / total) * 100 : 0;
  const color =
    tone === "warn" ? "bg-warning" : tone === "low" ? "bg-destructive" : "bg-primary";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
