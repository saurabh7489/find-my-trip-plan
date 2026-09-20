// Demo mode: 5 fictional travellers with deliberately conflicting preferences.
import { saveTrip } from "./store";

export const DEMO_CODE = "GOA2026";

export function buildDemoTrip() {
  return {
    code: DEMO_CODE,
    name: "Goa Trip 2026",
    destination: "Goa",
    startDate: "2026-10-09",
    endDate: "2026-10-14",
    people: 5,
    creator: "Rahul",
    demo: true,
    createdAt: Date.now(),
    votes: {},
    finalPlanId: null,
    itinerary: null,
    members: [
      {
        id: "demo-1",
        name: "Rahul",
        availableDates: ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13"],
        budgetMin: 6000,
        budgetMax: 9000,
        activities: ["Beach", "Food", "Sightseeing", "Nightlife"],
        tripStyle: "Balanced",
      },
      {
        id: "demo-2",
        name: "Aman",
        availableDates: ["2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14"],
        budgetMin: 7000,
        budgetMax: 12000,
        activities: ["Trekking", "Adventure", "Food", "Beach"],
        tripStyle: "Packed",
      },
      {
        id: "demo-3",
        name: "Priya",
        availableDates: ["2026-10-09", "2026-10-11", "2026-10-12", "2026-10-13"],
        budgetMin: 5000,
        budgetMax: 8000,
        activities: ["Beach", "Sightseeing", "Shopping", "Relaxing"],
        tripStyle: "Relaxed",
      },
      {
        id: "demo-4",
        name: "Neha",
        availableDates: ["2026-10-11", "2026-10-12", "2026-10-13"],
        budgetMin: 5500,
        budgetMax: 7500,
        activities: ["Beach", "Food", "Sightseeing", "Relaxing"],
        tripStyle: "Relaxed",
      },
      {
        id: "demo-5",
        name: "Rohit",
        availableDates: ["2026-10-10", "2026-10-12", "2026-10-13"],
        budgetMin: 6500,
        budgetMax: 10000,
        activities: ["Trekking", "Sightseeing", "Beach", "Adventure"],
        tripStyle: "Packed",
      },
    ],
  };
}

export function seedDemoTrip() {
  return saveTrip(buildDemoTrip());
}
