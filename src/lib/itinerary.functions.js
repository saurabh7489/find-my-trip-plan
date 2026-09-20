import { createServerFn } from "@tanstack/react-start";

// Sends the finalized group plan to Gemini and asks for a day-wise itinerary.
export const generateItinerary = createServerFn({ method: "POST" })
  .inputValidator((data) => data)
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this project.");

    const prompt = `Create a practical, realistic day-wise itinerary for a group trip.

Destination: ${data.destination}
Dates: ${data.dates?.join(", ")}
Number of travellers: ${data.people}
Budget per person (hard limit): INR ${data.budgetPerPerson}
Activities the group agreed on: ${(data.activities || []).join(", ")}
Trip style: ${data.style}

Rules:
- Stay inside the budget. Do not invent expensive or luxury activities.
- Only use the agreed activities plus normal travel basics (travel, check-in, meals, rest).
- ${data.style === "Relaxed" ? "Keep 4-5 items per day with slow mornings." : data.style === "Packed" ? "Use 7-8 items per day." : "Use 6 items per day."}
- One entry per day for each date listed.

Return ONLY JSON in this exact shape, no markdown:
{"days":[{"date":"YYYY-MM-DD","title":"Day 1","items":[{"time":"08:00","activity":"Departure"}]}],"estimatedBudgetPerPerson":7800,"tip":"one short practical tip"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          {
            role: "system",
            content: "You are a budget-conscious travel planner. You always reply with raw JSON.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Too many requests right now. Try again in a minute.");
      if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
      throw new Error(`Itinerary generation failed [${res.status}]: ${body}`);
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
      throw new Error("The AI reply could not be read. Please regenerate.");
    }
  });
