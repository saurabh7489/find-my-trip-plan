import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { TopBar, Card } from "@/components/TripShell";
import { createTrip } from "@/lib/store";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Trip — TripSync" },
      {
        name: "description",
        content: "Start a group trip on TripSync and get a shareable code for your friends.",
      },
      { property: "og:title", content: "Create a Trip — TripSync" },
      { property: "og:description", content: "Start a group trip and invite your friends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateTrip,
});

const field =
  "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function CreateTrip() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    people: 4,
    creator: "",
  });
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setCreated(createTrip(form));
  };

  if (created) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="mx-auto max-w-lg px-4 py-14">
          <Card className="text-center">
            <h1 className="text-xl font-semibold">{created.name} is ready</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Share this code with your friends so they can submit preferences.
            </p>
            <div className="mt-5 rounded-xl bg-accent p-5">
              <div className="text-3xl font-bold tracking-widest text-primary">{created.code}</div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(created.code);
                setCopied(true);
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy code"}
            </button>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/join"
                search={{ code: created.code }}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Add my preferences
              </Link>
              <button
                onClick={() => navigate({ to: "/trip/$code", params: { code: created.code } })}
                className="rounded-xl border border-border px-4 py-2.5 text-sm"
              >
                Go to group dashboard
              </button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <h1 className="text-xl font-semibold">Create a New Trip</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the details and invite your friends.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm">
              Trip name
              <input required className={field} value={form.name} onChange={set("name")} placeholder="Goa Trip 2026" />
            </label>
            <label className="block text-sm">
              Destination
              <input required className={field} value={form.destination} onChange={set("destination")} placeholder="Goa" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Possible start date
                <input required type="date" className={field} value={form.startDate} onChange={set("startDate")} />
              </label>
              <label className="block text-sm">
                Possible end date
                <input required type="date" className={field} value={form.endDate} onChange={set("endDate")} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Number of people
                <input required type="number" min="2" max="20" className={field} value={form.people} onChange={set("people")} />
              </label>
              <label className="block text-sm">
                Your name
                <input required className={field} value={form.creator} onChange={set("creator")} placeholder="Rahul" />
              </label>
            </div>
            <button className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
              Create Trip
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
