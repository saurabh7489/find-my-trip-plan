// Tiny browser-storage "database" for TripSync.
// Shape mirrors a simple Firestore layout:
// trips/{code} -> { name, destination, startDate, endDate, people, members[], votes, finalPlanId, itinerary }

const KEY = "tripsync.trips";

function readAll() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(all) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("tripsync-updated"));
}

export function makeTripCode(destination) {
  const base = (destination || "TRIP")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 4) || "TRIP";
  const year = new Date().getFullYear();
  let code = `${base}${year}`;
  const all = readAll();
  let n = 2;
  while (all[code]) code = `${base}${year}-${n++}`;
  return code;
}

export function getTrip(code) {
  return readAll()[(code || "").toUpperCase()] || null;
}

export function saveTrip(trip) {
  const all = readAll();
  all[trip.code] = trip;
  writeAll(all);
  return trip;
}

export function createTrip({ name, destination, startDate, endDate, people, creator }) {
  const code = makeTripCode(destination);
  return saveTrip({
    code,
    name,
    destination,
    startDate,
    endDate,
    people: Number(people) || 2,
    creator: creator || "",
    members: [],
    votes: {},
    finalPlanId: null,
    itinerary: null,
    createdAt: Date.now(),
  });
}

export function upsertMember(code, member) {
  const trip = getTrip(code);
  if (!trip) return null;
  const existing = trip.members.findIndex(
    (m) => m.name.toLowerCase() === member.name.toLowerCase(),
  );
  if (existing >= 0) trip.members[existing] = { ...trip.members[existing], ...member };
  else trip.members.push({ id: crypto.randomUUID(), ...member });
  return saveTrip(trip);
}

export function castVote(code, memberName, planId, choice) {
  const trip = getTrip(code);
  if (!trip) return null;
  trip.votes = trip.votes || {};
  trip.votes[planId] = trip.votes[planId] || {};
  trip.votes[planId][memberName] = choice;
  return saveTrip(trip);
}

export function finalizePlan(code, planId) {
  const trip = getTrip(code);
  if (!trip) return null;
  trip.finalPlanId = planId;
  trip.itinerary = null;
  return saveTrip(trip);
}

export function setItinerary(code, itinerary) {
  const trip = getTrip(code);
  if (!trip) return null;
  trip.itinerary = itinerary;
  return saveTrip(trip);
}

export function listTrips() {
  return Object.values(readAll()).sort((a, b) => b.createdAt - a.createdAt);
}
