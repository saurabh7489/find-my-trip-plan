// TripSync consensus engine — plain, deterministic JavaScript. No AI here.

export const ACTIVITY_OPTIONS = [
  "Beach",
  "Trekking",
  "Sightseeing",
  "Food",
  "Shopping",
  "Adventure",
  "Nightlife",
  "Relaxing",
];

export const TRIP_STYLES = ["Relaxed", "Balanced", "Packed"];

/** List every ISO date (YYYY-MM-DD) between two dates, inclusive. */
export function listDates(start, end) {
  const out = [];
  if (!start || !end) return out;
  const d = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatRange(dates) {
  if (!dates || dates.length === 0) return "No common dates";
  if (dates.length === 1) return formatDate(dates[0]);
  return `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`;
}

export function formatMoney(n) {
  return "₹" + Math.round(n || 0).toLocaleString("en-IN");
}

/**
 * findDateOverlap: for each candidate date, count how many members are free.
 * Returns the longest run of dates that all hit the maximum availability.
 */
export function findDateOverlap(trip, members) {
  const candidates = listDates(trip.startDate, trip.endDate);
  const counts = candidates.map((date) => ({
    date,
    count: members.filter((m) => (m.availableDates || []).includes(date)).length,
  }));

  const max = counts.reduce((a, c) => Math.max(a, c.count), 0);

  // longest consecutive streak of dates with max availability
  let best = [];
  let run = [];
  for (const c of counts) {
    if (c.count === max && max > 0) {
      run.push(c.date);
      if (run.length > best.length) best = [...run];
    } else {
      run = [];
    }
  }

  return {
    perDate: counts,
    bestDates: best,
    availableCount: max,
    totalMembers: members.length,
    everyoneAvailable: max === members.length && members.length > 0,
  };
}

/** calculateActivityVotes: how many members picked each activity. */
export function calculateActivityVotes(members) {
  const tally = {};
  members.forEach((m) => {
    (m.activities || []).forEach((a) => {
      tally[a] = (tally[a] || 0) + 1;
    });
  });
  return Object.entries(tally)
    .map(([name, votes]) => ({
      name,
      votes,
      total: members.length,
      percent: members.length ? Math.round((votes / members.length) * 100) : 0,
    }))
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name));
}

/** calculateBudgetOverlap: intersection of everyone's [min,max] range. */
export function calculateBudgetOverlap(members) {
  if (members.length === 0) return { min: 0, max: 0, overlaps: false, lowestMax: 0, highestMin: 0 };
  const highestMin = Math.max(...members.map((m) => m.budgetMin || 0));
  const lowestMax = Math.min(...members.map((m) => m.budgetMax || 0));
  const overlaps = highestMin <= lowestMax;
  return {
    overlaps,
    highestMin,
    lowestMax,
    // when ranges don't overlap we fall back to a fair middle band
    min: overlaps ? highestMin : Math.round((highestMin + lowestMax) / 2 - 500),
    max: overlaps ? lowestMax : Math.round((highestMin + lowestMax) / 2 + 500),
  };
}

/** calculateTripStyle: most voted style. */
export function calculateTripStyle(members) {
  const tally = {};
  members.forEach((m) => {
    if (m.tripStyle) tally[m.tripStyle] = (tally[m.tripStyle] || 0) + 1;
  });
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  return {
    style: entries.length ? entries[0][0] : "Balanced",
    votes: entries.length ? entries[0][1] : 0,
    tally,
  };
}

/** calculateCompatibility: 0-100 score from dates, activities and budget. */
export function calculateCompatibility(trip, members) {
  if (members.length === 0) return 0;
  const overlap = findDateOverlap(trip, members);
  const votes = calculateActivityVotes(members);
  const budget = calculateBudgetOverlap(members);

  const dateScore = overlap.totalMembers ? overlap.availableCount / overlap.totalMembers : 0;

  const top = votes.slice(0, 4);
  const activityScore = top.length
    ? top.reduce((s, v) => s + v.votes / v.total, 0) / top.length
    : 0;

  let budgetScore = 0;
  if (budget.overlaps) {
    const span = budget.lowestMax - budget.highestMin;
    budgetScore = 0.8 + Math.min(span / 5000, 1) * 0.2;
  } else {
    const gap = budget.highestMin - budget.lowestMax;
    budgetScore = Math.max(0, 0.7 - gap / 10000);
  }

  const score = dateScore * 0.4 + activityScore * 0.35 + budgetScore * 0.25;
  return Math.round(score * 100);
}

/** detectConflicts: human-readable reasons the group isn't perfectly aligned. */
export function detectConflicts(trip, members) {
  const conflicts = [];
  if (members.length === 0) return conflicts;

  const overlap = findDateOverlap(trip, members);
  if (!overlap.everyoneAvailable) {
    conflicts.push({
      type: "dates",
      title: "Not everyone is available on the same dates",
      detail: `Best overlap: ${formatRange(overlap.bestDates)} — ${overlap.availableCount}/${overlap.totalMembers} members available.`,
    });
  }

  const votes = calculateActivityVotes(members);
  const split = votes.filter((v) => v.votes > 0 && v.votes < v.total);
  if (split.length) {
    conflicts.push({
      type: "activities",
      title: "Activity preferences are split",
      detail: split
        .slice(0, 4)
        .map((v) => `${v.name}: ${v.votes}/${v.total}`)
        .join(" · "),
    });
  }

  const budget = calculateBudgetOverlap(members);
  if (!budget.overlaps) {
    conflicts.push({
      type: "budget",
      title: "Budgets don't fully overlap",
      detail: `Someone can spend at most ${formatMoney(budget.lowestMax)} while someone else wants to start at ${formatMoney(budget.highestMin)}. Suggested middle ground: ${formatMoney(budget.min)}–${formatMoney(budget.max)}.`,
    });
  }

  const style = calculateTripStyle(members);
  if (style.votes < members.length) {
    conflicts.push({
      type: "style",
      title: "Trip style isn't unanimous",
      detail: Object.entries(style.tally)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · "),
    });
  }

  return conflicts;
}

/** Why each activity made it in or not. */
export function explainActivities(members) {
  const votes = calculateActivityVotes(members);
  const threshold = Math.ceil(members.length / 2);
  return votes.map((v) => ({
    ...v,
    included: v.votes >= threshold,
    reason:
      v.votes >= threshold
        ? `${v.name} was included because ${v.votes}/${v.total} members selected it.`
        : `${v.name} was excluded because only ${v.votes}/${v.total} members selected it.`,
  }));
}

/** generatePlanOptions: 3 deterministic compromises the group can vote on. */
export function generatePlanOptions(trip, members) {
  if (members.length === 0) return [];
  const overlap = findDateOverlap(trip, members);
  const votes = calculateActivityVotes(members);
  const budget = calculateBudgetOverlap(members);
  const style = calculateTripStyle(members);

  const core = votes.filter((v) => v.votes >= Math.ceil(members.length / 2)).map((v) => v.name);
  const wide = votes.filter((v) => v.votes >= 2).map((v) => v.name);

  const midBudget = Math.round((budget.min + budget.max) / 2 / 100) * 100;

  return [
    {
      id: "A",
      name: "Plan A — Maximum Participation",
      dates: overlap.bestDates,
      peopleAvailable: overlap.availableCount,
      totalMembers: members.length,
      budgetPerPerson: midBudget,
      activities: core.slice(0, 3),
      style: style.style,
      note: "Uses the dates the most people can make and only activities the majority wants.",
    },
    {
      id: "B",
      name: "Plan B — More Activities",
      dates: overlap.bestDates,
      peopleAvailable: Math.max(overlap.availableCount - 1, 1),
      totalMembers: members.length,
      budgetPerPerson: Math.round((midBudget * 1.15) / 100) * 100,
      activities: wide.slice(0, 5),
      style: "Packed",
      note: "Fits in more of everyone's wishes, costs a bit more and one person may miss a day.",
    },
    {
      id: "C",
      name: "Plan C — Lower Budget",
      dates: overlap.bestDates.slice(0, Math.max(1, overlap.bestDates.length - 1)),
      peopleAvailable: overlap.availableCount,
      totalMembers: members.length,
      budgetPerPerson: Math.round((budget.min * 0.9) / 100) * 100,
      activities: core.slice(0, 2),
      style: "Relaxed",
      note: "Shorter and cheaper so the tightest budget in the group still works.",
    },
  ];
}
