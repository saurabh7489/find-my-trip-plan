import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, Handshake, Sparkles, PlayCircle } from "lucide-react";
import { TopBar, Card } from "@/components/TripShell";
import { seedDemoTrip, DEMO_CODE } from "@/lib/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TripSync — Plan together. Find the common ground." },
      {
        name: "description",
        content:
          "TripSync turns different schedules, budgets and preferences into one group trip everyone can agree on.",
      },
      { property: "og:title", content: "TripSync — Plan together" },
      {
        property: "og:description",
        content: "Group trip planning built around consensus, not guesswork.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  const startDemo = () => {
    seedDemoTrip();
    navigate({ to: "/trip/$code", params: { code: DEMO_CODE } });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        right={
          <button onClick={startDemo} className="flex items-center gap-1.5 hover:text-foreground">
            <PlayCircle className="h-4 w-4" /> Demo
          </button>
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-14">
        <section className="rounded-3xl bg-gradient-to-br from-primary/10 via-accent/40 to-background p-8 sm:p-12">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Plan together.
            <br />
            Find the common ground.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            TripSync helps groups turn different schedules, budgets and preferences into one trip
            everyone can agree on.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/create"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Create a Trip
            </Link>
            <Link
              to="/join"
              className="rounded-xl border border-primary/30 bg-card px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-accent"
            >
              Join a Trip
            </Link>
            <button
              onClick={startDemo}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Try the demo trip →
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: CalendarCheck,
              title: "Share your preferences",
              text: "Dates, budget, activities and pace — one short form each.",
            },
            {
              icon: Handshake,
              title: "Find the overlap",
              text: "A plain, explainable engine finds common dates, budget and activities.",
            },
            {
              icon: Sparkles,
              title: "Get a shared itinerary",
              text: "Vote on a plan, then AI writes the day-wise schedule.",
            },
          ].map((f) => (
            <Card key={f.title}>
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </Card>
          ))}
        </section>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          TripSync doesn't just create a trip plan. It finds a plan a group can actually agree on.
        </p>
      </main>
    </div>
  );
}
