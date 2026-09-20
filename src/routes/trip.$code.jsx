import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  CalendarDays,
  IndianRupee,
  Users,
  Wand2,
  RefreshCw,
  Share2,
  Pencil,
  ThumbsUp,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { TopBar, Card, Bar } from "@/components/TripShell";
import { getTrip, castVote, finalizePlan, setItinerary } from "@/lib/store";
import { seedDemoTrip } from "@/lib/demo";
import { generateItinerary } from "@/lib/itinerary.functions";
import {
  findDateOverlap,
  calculateActivityVotes,
  calculateBudgetOverlap,
  calculateCompatibility,
  calculateTripStyle,
  detectConflicts,
  explainActivities,
  generatePlanOptions,
  formatRange,
  formatDate,
  formatMoney,
} from "@/lib/consensus";

export const Route = createFileRoute("/trip/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.code} — Group dashboard | TripSync` },
      {
        name: "description",
        content:
          "See the group's common dates, budget and activities, resolve conflicts and vote on a plan.",
      },
      { property: "og:title", content: `Trip ${params.code} — TripSync` },
      { property: "og:description", content: "Group consensus dashboard for your trip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TripPage,
});

const TABS = ["Dashboard", "Conflicts", "Plans & Voting", "Itinerary"];

function TripPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("Dashboard");

  const refresh = () => setTrip(getTrip(code));

  useEffect(() => {
    let found = getTrip(code);
    if (!found && code === "GOA2026") found = seedDemoTrip();
    setTrip(found);
    setReady(true);
    const onUpdate = () => setTrip(getTrip(code));
    window.addEventListener("tripsync-updated", onUpdate);
    return () => window.removeEventListener("tripsync-updated", onUpdate);
  }, [code]);

  if (!ready) return null;

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <Card>
            <h1 className="text-lg font-semibold">Trip not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Trips are stored on the device that created them. Ask for the code again or start a
              new trip.
            </p>
            <Link to="/" className="mt-5 inline-block text-sm text-primary">
              Back home
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  const members = trip.members || [];

  return (
    <div className="min-h-screen bg-background">
      <TopBar right={<span className="font-mono">{trip.code}</span>} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{trip.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{trip.destination}</span>
              <span>
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              <span>
                {members.length}/{trip.people} members
              </span>
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/join", search: { code: trip.code } })}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add / edit preferences
          </button>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {members.length === 0 ? (
            <Card>
              <p className="text-sm text-muted-foreground">
                No preferences yet. Share the code <b className="font-mono">{trip.code}</b> with your
                friends, or add yours to get started.
              </p>
            </Card>
          ) : tab === "Dashboard" ? (
            <Dashboard trip={trip} members={members} />
          ) : tab === "Conflicts" ? (
            <Conflicts trip={trip} members={members} />
          ) : tab === "Plans & Voting" ? (
            <Voting trip={trip} members={members} refresh={refresh} goItinerary={() => setTab("Itinerary")} />
          ) : (
            <Itinerary trip={trip} members={members} refresh={refresh} />
          )}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ trip, members }) {
  const overlap = findDateOverlap(trip, members);
  const votes = calculateActivityVotes(members);
  const budget = calculateBudgetOverlap(members);
  const style = calculateTripStyle(members);
  const score = calculateCompatibility(trip, members);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="font-semibold">Trip summary</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <Row icon={CalendarDays} label="Best common dates" value={formatRange(overlap.bestDates)} sub={`${overlap.availableCount}/${members.length} members available`} />
          <Row icon={IndianRupee} label="Budget range" value={`${formatMoney(budget.min)} – ${formatMoney(budget.max)}`} sub={budget.overlaps ? "Everyone's range overlaps" : "Suggested middle ground"} />
          <Row icon={Users} label="Trip style" value={style.style} sub={`${style.votes}/${members.length} members` } />
        </dl>
        <div className="mt-5 rounded-xl bg-accent p-4">
          <p className="text-sm text-muted-foreground">Trip compatibility</p>
          <p className="text-3xl font-bold text-primary">{score}%</p>
          <p className="mt-1 text-xs text-muted-foreground">
            40% dates · 35% activity agreement · 25% budget fit
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Activity preferences</h2>
        <ul className="mt-4 space-y-3">
          {votes.map((v) => (
            <li key={v.name}>
              <div className="flex justify-between text-sm">
                <span>{v.name}</span>
                <span className="text-muted-foreground">
                  {v.votes}/{v.total}
                </span>
              </div>
              <div className="mt-1">
                <Bar value={v.votes} total={v.total} tone={v.percent >= 60 ? "primary" : v.percent >= 40 ? "warn" : "low"} />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="md:col-span-2">
        <h2 className="font-semibold">Members ({members.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div key={m.id} className="rounded-xl border border-border p-3 text-sm">
              <p className="font-medium">{m.name}</p>
              <p className="mt-1 text-muted-foreground">
                {(m.availableDates || []).map(formatDate).join(", ") || "No dates"}
              </p>
              <p className="text-muted-foreground">
                {formatMoney(m.budgetMin)} – {formatMoney(m.budgetMax)} · {m.tripStyle}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{(m.activities || []).join(", ")}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function Conflicts({ trip, members }) {
  const conflicts = detectConflicts(trip, members);
  const overlap = findDateOverlap(trip, members);
  const explained = explainActivities(members);

  return (
    <div className="space-y-4">
      {conflicts.length === 0 ? (
        <Card>
          <h2 className="font-semibold text-primary">No conflicts — everyone matches!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Head to Plans & Voting to pick the final plan.
          </p>
        </Card>
      ) : (
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5 text-warning" /> We found some conflicts
          </h2>
          <ul className="mt-4 space-y-4">
            {conflicts.map((c) => (
              <li key={c.type} className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.detail}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold">Day-by-day availability</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {overlap.perDate.map((d) => (
            <div key={d.date} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>{formatDate(d.date)}</span>
              <span className={d.count === members.length ? "text-primary" : "text-muted-foreground"}>
                {d.count}/{members.length} available
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Why each activity was included or excluded</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {explained.map((a) => (
            <li key={a.name} className={a.included ? "text-foreground" : "text-muted-foreground"}>
              {a.reason}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Voting({ trip, members, refresh, goItinerary }) {
  const plans = useMemo(() => generatePlanOptions(trip, members), [trip, members]);
  const [voter, setVoter] = useState(members[0]?.name || "");

  const counts = (planId) => {
    const v = trip.votes?.[planId] || {};
    const list = Object.values(v);
    return {
      approve: list.filter((x) => x === "approve").length,
      changes: list.filter((x) => x === "changes").length,
      mine: v[voter],
    };
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Choose a plan</h2>
          <p className="text-sm text-muted-foreground">
            Review the options and vote as a group. No plan is called "best" — the group decides.
          </p>
        </div>
        <label className="text-sm text-muted-foreground">
          Voting as{" "}
          <select
            value={voter}
            onChange={(e) => setVoter(e.target.value)}
            className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {members.map((m) => (
              <option key={m.id}>{m.name}</option>
            ))}
          </select>
        </label>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const c = counts(p.id);
          const selected = trip.finalPlanId === p.id;
          return (
            <Card key={p.id} className={selected ? "ring-2 ring-primary" : ""}>
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>{formatRange(p.dates)}</li>
                <li>
                  {p.peopleAvailable}/{p.totalMembers} people available
                </li>
                <li className="font-medium">{formatMoney(p.budgetPerPerson)}/person</li>
                <li className="text-muted-foreground">{p.activities.join(" · ")}</li>
                <li className="text-muted-foreground">Pace: {p.style}</li>
              </ul>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    castVote(trip.code, voter, p.id, "approve");
                    refresh();
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-sm font-medium ${
                    c.mine === "approve"
                      ? "bg-primary text-primary-foreground"
                      : "border border-primary/40 text-primary"
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    castVote(trip.code, voter, p.id, "changes");
                    refresh();
                  }}
                  className={`w-full rounded-xl border px-3 py-2 text-sm ${
                    c.mine === "changes" ? "border-warning text-warning" : "border-border text-muted-foreground"
                  }`}
                >
                  Suggest changes
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" /> {c.approve}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" /> {c.changes}
                </span>
              </div>
              <button
                onClick={() => {
                  finalizePlan(trip.code, p.id);
                  refresh();
                  goItinerary();
                }}
                className="mt-4 w-full rounded-xl bg-foreground px-3 py-2 text-sm font-medium text-background"
              >
                {selected ? "Selected — open itinerary" : "Lock this plan"}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Itinerary({ trip, members, refresh }) {
  const plans = useMemo(() => generatePlanOptions(trip, members), [trip, members]);
  const plan = plans.find((p) => p.id === trip.finalPlanId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shared, setShared] = useState(false);

  const run = async () => {
    if (!plan) return;
    setLoading(true);
    setError("");
    try {
      const result = await generateItinerary({
        data: {
          destination: trip.destination,
          dates: plan.dates,
          people: members.length,
          budgetPerPerson: plan.budgetPerPerson,
          activities: plan.activities,
          style: plan.style,
        },
      });
      setItinerary(trip.code, result);
      refresh();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          Lock a plan in Plans & Voting first, then we'll build the shared itinerary.
        </p>
      </Card>
    );
  }

  const it = trip.itinerary;

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">{trip.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatRange(plan.dates)} · {members.length} travellers · Estimated{" "}
            {formatMoney(it?.estimatedBudgetPerPerson || plan.budgetPerPerson)}/person
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            to="/join"
            search={{ code: trip.code }}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2"
          >
            <Pencil className="h-4 w-4" /> Edit plan
          </Link>
          <button
            onClick={run}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" /> Regenerate
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setShared(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-primary-foreground"
          >
            <Share2 className="h-4 w-4" /> {shared ? "Link copied" : "Share trip"}
          </button>
        </div>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {!it ? (
        <Card className="text-center">
          <Wand2 className="mx-auto h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Generate your shared itinerary</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Built from {plan.name.toLowerCase()}: {plan.activities.join(", ")} in {trip.destination},
            within {formatMoney(plan.budgetPerPerson)} per person.
          </p>
          <button
            onClick={run}
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating the perfect itinerary…" : "Generate itinerary"}
          </button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(it.days || []).map((d, i) => (
            <Card key={i}>
              <h3 className="font-semibold">
                {d.title || `Day ${i + 1}`}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {formatDate(d.date)}
                </span>
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {(d.items || []).map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="w-14 shrink-0 font-mono text-muted-foreground">{item.time}</span>
                    <span>{item.activity}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
          {it.tip && (
            <Card className="md:col-span-2 bg-accent">
              <p className="text-sm">{it.tip}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
