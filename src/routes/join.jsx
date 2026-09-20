import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar, Card } from "@/components/TripShell";
import { getTrip, upsertMember } from "@/lib/store";
import { ACTIVITY_OPTIONS, TRIP_STYLES, listDates, formatDate } from "@/lib/consensus";

export const Route = createFileRoute("/join")({
  validateSearch: (search) => ({ code: search.code ? String(search.code) : "" }),
  head: () => ({
    meta: [
      { title: "Join a Trip — TripSync" },
      {
        name: "description",
        content: "Enter your trip code and share your dates, budget and favourite activities.",
      },
      { property: "og:title", content: "Join a Trip — TripSync" },
      { property: "og:description", content: "Share your preferences with the group." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinTrip,
});

const field =
  "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function JoinTrip() {
  const { code: initialCode } = Route.useSearch();
  const navigate = useNavigate();
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState("");
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");

  const join = (e) => {
    e.preventDefault();
    const found = getTrip(code);
    if (!found) return setError("No trip found with that code on this device.");
    setError("");
    setTrip(found);
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="mx-auto max-w-md px-4 py-14">
          <Card>
            <h1 className="text-xl font-semibold">Join a Trip</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the trip code shared by your friend and your name to get started.
            </p>
            <form onSubmit={join} className="mt-5 space-y-4">
              <label className="block text-sm">
                Trip code
                <input
                  required
                  className={`${field} uppercase tracking-widest`}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="GOA2026"
                />
              </label>
              <label className="block text-sm">
                Your name
                <input required className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                Join Trip
              </button>
            </form>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <PreferenceForm
      trip={trip}
      name={name}
      onDone={() => navigate({ to: "/trip/$code", params: { code: trip.code } })}
    />
  );
}

function PreferenceForm({ trip, name, onDone }) {
  const existing = trip.members.find((m) => m.name.toLowerCase() === name.toLowerCase());
  const [dates, setDates] = useState(existing?.availableDates || []);
  const [budgetMin, setBudgetMin] = useState(existing?.budgetMin ?? 5000);
  const [budgetMax, setBudgetMax] = useState(existing?.budgetMax ?? 8000);
  const [activities, setActivities] = useState(existing?.activities || []);
  const [custom, setCustom] = useState("");
  const [style, setStyle] = useState(existing?.tripStyle || "Balanced");
  const all = listDates(trip.startDate, trip.endDate);

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = (e) => {
    e.preventDefault();
    upsertMember(trip.code, {
      name,
      availableDates: dates,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      activities,
      tripStyle: style,
    });
    onDone();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar right={<span>{trip.name}</span>} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <h1 className="text-xl font-semibold">Your Preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hi {name} — help us find the best plan for everyone.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-7">
            <section>
              <h2 className="text-sm font-semibold">1. Available dates</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {all.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggle(dates, setDates, d)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      dates.includes(d)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {formatDate(d)}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold">2. Budget (per person)</h2>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <label className="block text-sm text-muted-foreground">
                  Minimum ₹
                  <input type="number" min="0" step="500" className={field} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
                </label>
                <label className="block text-sm text-muted-foreground">
                  Maximum ₹
                  <input type="number" min="0" step="500" className={field} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold">3. Activities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...new Set([...ACTIVITY_OPTIONS, ...activities])].map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => toggle(activities, setActivities, a)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      activities.includes(a)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className={field}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Add your own activity"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (custom.trim()) setActivities([...activities, custom.trim()]);
                    setCustom("");
                  }}
                  className="mt-1 rounded-xl border border-border px-4 text-sm"
                >
                  Add
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold">4. Trip style</h2>
              <div className="mt-2 flex gap-2">
                {TRIP_STYLES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                      style === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              Submit preferences
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
