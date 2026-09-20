# Agreeable Trips

Build a simple full-stack hackathon project called TripSync.

Project Idea

TripSync is a group trip planning application.

The problem: planning a group trip becomes difficult because every person has different available dates, budgets, and preferred activities.

The app should allow everyone to submit their preferences, find the common overlap, identify conflicts, suggest the best compromise, and automatically generate a shared itinerary.

The main goal is group consensus, not just AI itinerary generation.

Simple Tech Stack

Use only:

Frontend

React

Vite

Tailwind CSS

Backend

Node.js

Express.js

Database

Firebase Firestore

AI

Gemini API

Do NOT introduce Next.js, Redux, TypeScript, Docker, microservices, or other unnecessary technologies.

Keep the project beginner-friendly and easy to understand.

Main User Flow

Create this flow:

Create Trip
     ↓
Invite Friends
     ↓
Friends submit preferences
     ↓
Calculate common preferences
     ↓
Detect conflicts
     ↓
Suggest best compromise
     ↓
Group votes/approves
     ↓
Generate shared itinerary


1. Landing Page

Create a clean modern landing page.

Title:

TripSync

Subtitle:

Plan together. Find the common ground.

Description:

"TripSync helps groups turn different schedules, budgets and preferences into one trip everyone can agree on."

Buttons:

Create a Trip

Join a Trip

Keep the design simple and responsive.

2. Create Trip

Create a form with:

Trip name

Destination

Possible start date

Possible end date

Number of people

After creating the trip, generate a simple shareable trip code.

Example:

GOA2026


Display:

Share this code with your friends.

3. Join Trip

Allow users to enter:

Trip code

Name

After joining, show the preference form.

4. Preference Form

Each participant should enter:

Available dates

Allow them to select which dates they are available.

Budget

Example:

Minimum budget: ₹5000
Maximum budget: ₹8000


Activities

Provide selectable activities:

Beach

Trekking

Sightseeing

Food

Shopping

Adventure

Nightlife

Relaxing

Also allow users to add a custom activity.

Trip style

Allow selection between:

Relaxed

Balanced

Packed

Keep this form simple.

5. Preference Dashboard

After everyone submits their preferences, show a group dashboard.

Example:

GOA TRIP

5 Members

Available dates:
11–12 October

Budget:
₹7,000–₹8,000

Activities:

Beach          5/5
Sightseeing    5/5
Food           4/5
Trekking       3/5
Nightlife      1/5


Use simple progress bars or percentages.

6. Consensus / Compatibility Engine

Create a simple deterministic JavaScript algorithm.

Do NOT use AI for this part.

The algorithm should calculate:

Date overlap

Find dates where the maximum number of people are available.

Activity compatibility

Calculate how many people selected each activity.

Example:

Beach → 5/5
Food → 4/5
Trekking → 3/5
Nightlife → 1/5


Budget

Find the overlapping budget range.

Example:

Group budget:
₹7,000–₹8,000


Compatibility score

Create a simple score based on:

Date availability

Activity agreement

Budget compatibility

Display:

Trip Compatibility

87%


The score is only an internal product metric, not an AI-generated opinion.

7. Conflict Detection

If preferences conflict, clearly show them.

Example:

⚠ Group Conflict

Not everyone is available on the same dates.

Best overlap:
11–12 October

5/6 members available.


Another example:

Activity conflict

Trekking:
4/6 members

Nightlife:
1/6 members


Explain why an activity was included or excluded.

Example:

Trekking was included because 4/6 members selected it.

Nightlife was excluded because only 1/6 members selected it.


8. Alternative Plans

If there is no perfect solution, generate 2–3 simple alternatives.

Example:

Plan A — Maximum Participation

5/5 people available
₹7,500/person

Beach
Food
Sightseeing


Plan B — More Activities

4/5 people available
₹8,500/person

Beach
Trekking
Food
Sightseeing


Plan C — Lower Budget

5/5 people available
₹6,000/person

Beach
Sightseeing


Do not call these "best" based on an AI opinion.

Let the group choose.

9. Group Voting

Show the suggested plans.

Each participant can select:

Approve

Suggest Changes

Show the vote count.

Example:

Plan A

Approve: 4
Changes: 1

[Approve Plan]


Once the group approves a plan, move to itinerary generation.

For the MVP, you can simulate multiple users using a simple local/demo flow if implementing real-time multi-user voting becomes too complicated.

10. AI Itinerary Generation

After the group selects a plan, send the finalized information to Gemini.

The AI should generate a practical itinerary using:

Destination

Dates

Budget

Selected activities

Trip style

Number of people

Example output:

DAY 1

8:00 AM
Departure

11:00 AM
Hotel check-in

1:00 PM
Lunch

3:00 PM
Beach

6:00 PM
Sunset viewpoint

8:00 PM
Dinner


DAY 2

8:00 AM
Breakfast

9:00 AM
Trekking

1:00 PM
Lunch

3:00 PM
Sightseeing

7:00 PM
Dinner


The AI should not invent expensive activities or ignore the group's constraints.

11. Final Shared Itinerary

Create a clean itinerary page showing:

TripSync

GOA TRIP
11–12 October

5 Travelers

Estimated Budget:
₹7,800/person

---------------------

DAY 1

08:00 → Departure
11:00 → Hotel
13:00 → Lunch
15:00 → Beach
18:00 → Sunset
20:00 → Dinner

---------------------

DAY 2

08:00 → Breakfast
09:00 → Trek
13:00 → Lunch
15:00 → Sightseeing
19:00 → Dinner


Add buttons:

Edit Plan

Regenerate Itinerary

Share Trip

12. Firebase Database

Use a simple Firestore structure.

Example:

trips
  └── tripId
       ├── name
       ├── destination
       ├── dates
       ├── creator
       └── members

members
  └── memberId
       ├── name
       ├── availableDates
       ├── budget
       ├── activities
       └── tripStyle


Keep the database structure simple.

13. UI Design

Use a modern but simple design.

Style:

Clean white/light background

Cards

Rounded corners

Simple shadows

Clear typography

Green/blue accent color

Responsive mobile layout

Important pages:

Landing
   ↓
Create / Join Trip
   ↓
Preference Form
   ↓
Group Dashboard
   ↓
Conflict Resolution
   ↓
Plan Voting
   ↓
Final Itinerary


Do not create unnecessary pages.

14. Important Technical Requirement

Separate the application logic into clear functions.

For example:

findDateOverlap()
calculateActivityVotes()
calculateBudgetOverlap()
calculateCompatibility()
detectConflicts()
generatePlanOptions()


The consensus engine should be understandable and explainable.

Do not hide the core logic inside an AI prompt.

15. Demo Data

Include a demo mode with 5 fictional travelers so the entire application can be demonstrated immediately.

Example:

Rahul
Aman
Priya
Neha
Rohit


Give each person different:

Dates

Budgets

Activities

This should intentionally create conflicts so the consensus feature can be demonstrated.

16. Important MVP Rule

Prioritize these features:

Create trip

Join trip

Submit preferences

Calculate overlap

Detect conflicts

Generate alternative plans

Vote on a plan

Generate final itinerary with Gemini

If something becomes too complicated, simplify it instead of adding another library or service.

The application must remain easy for a student developer to understand, run locally, debug, and explain during a hackathon presentation.

Final Product Message

The application should communicate this clearly:

TripSync doesn't just create a trip plan. It finds a plan that a group can actually agree on.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b0294039-99ab-4f13-982e-cd2321217f93).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
