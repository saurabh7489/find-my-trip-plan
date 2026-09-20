# TripSync 🗺️

**Plan together. Find the common ground.**

TripSync is a full-stack group trip planning application that helps friends, families, and teams turn different schedules, budgets, and activity preferences into a trip plan everyone can agree on.

🔗 **Live Demo:**  https://tripsync-sigma.vercel.app/

---

## 💡 Problem

Planning a group trip can become complicated when everyone has different:

* Available dates
* Budgets
* Preferred activities
* Travel styles

Most group planning happens through multiple chats and discussions, making it difficult to find a plan that works for everyone.

TripSync focuses on **group consensus first**, rather than simply generating an AI itinerary.

---

## 🚀 How TripSync Works

```text
Create Trip
     ↓
Invite Friends
     ↓
Submit Preferences
     ↓
Find Common Ground
     ↓
Detect Conflicts
     ↓
Generate Alternative Plans
     ↓
Group Voting
     ↓
Generate Shared Itinerary
```

### 1. Create or Join a Trip

The organizer creates a trip and shares a trip code with other members.

### 2. Submit Preferences

Each member provides:

* Available dates
* Budget range
* Preferred activities
* Trip style

### 3. Find Common Ground

TripSync uses a deterministic JavaScript consensus engine to calculate:

* Date availability
* Activity preferences
* Budget overlap
* Overall compatibility

### 4. Detect Conflicts

The application clearly identifies disagreements between group members.

For example:

```text
Trekking: 4/5 members
Nightlife: 1/5 members
```

This makes it clear why certain activities are included or excluded.

### 5. Generate Alternative Plans

When there is no perfect solution, TripSync generates multiple plans with different trade-offs.

For example:

* Maximum participation
* More activities
* Lower budget

The application does not decide which plan is "best." The group chooses.

### 6. Group Voting

Members can vote on the proposed plans and collectively approve one.

### 7. AI Itinerary Generation

After the group approves a plan, Gemini generates a practical day-by-day itinerary based on the finalized:

* Destination
* Dates
* Budget
* Activities
* Trip style
* Number of travelers

---

## ✨ Key Features

* 🗓️ **Date Overlap** — Finds dates that work for the maximum number of members.
* 💰 **Budget Compatibility** — Calculates the overlapping budget range.
* 🎯 **Activity Consensus** — Shows how many members prefer each activity.
* ⚠️ **Conflict Detection** — Highlights disagreements in group preferences.
* 🔀 **Alternative Plans** — Provides multiple options when preferences conflict.
* 🗳️ **Group Voting** — Lets members collectively approve a plan.
* 🤖 **AI Itinerary Generation** — Uses Gemini to create the final day-by-day itinerary.
* 🧠 **Explainable Consensus Engine** — Core decisions are calculated using understandable JavaScript logic rather than AI.
* 📱 **Responsive Design** — Works across desktop and mobile screens.
* 🧪 **Demo Mode** — Includes sample travelers and conflicting preferences for demonstration.

---

## 🧠 Consensus Engine

The core decision-making does **not** depend on AI.

Important functions include:

```javascript
findDateOverlap()
calculateActivityVotes()
calculateBudgetOverlap()
calculateCompatibility()
detectConflicts()
generatePlanOptions()
```

The engine analyzes the group's preferences and produces transparent results.

For example:

```text
Beach          5/5
Sightseeing    5/5
Food           4/5
Trekking       3/5
Nightlife      1/5
```

This allows users to understand **why** a plan was created.

---

## 🤖 AI Integration

Gemini is used only after the group has agreed on a plan.

The finalized group decision is provided to Gemini, which generates a practical itinerary while considering the group's:

* Budget
* Dates
* Activities
* Destination
* Travel style

The AI is therefore used for **itinerary generation**, not for making the group's core decisions.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* Firebase Firestore

### AI

* Google Gemini API

### Tools

* JavaScript
* Git
* GitHub
* VS Code

### Deployment

* Vercel

---

## 📂 Project Flow

```text
Landing Page
     ↓
Create / Join Trip
     ↓
Preference Form
     ↓
Group Dashboard
     ↓
Consensus & Conflict Detection
     ↓
Alternative Plans
     ↓
Group Voting
     ↓
Final Shared Itinerary
```

---

## 🎯 MVP Features

The MVP focuses on:

* Create a trip
* Join a trip
* Submit preferences
* Calculate preference overlap
* Detect conflicts
* Generate alternative plans
* Vote on a plan
* Generate a final itinerary with Gemini

The project intentionally keeps the architecture simple so that the core functionality is easy to understand, run, debug, and demonstrate.

---

## 🌐 Live Demo

**Try TripSync:**
https://trip-plan-lilac.vercel.app/

---

## 💻 Development

### Prerequisites

You need:

* Node.js
* npm

### Clone the repository

```bash
git clone https://github.com/saurabh7489/find-my-trip-plan.git
cd find-my-trip-plan
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The application will then be available at the local development URL provided by Vite.

---

## 🔐 Environment Variables

Create a `.env` file and add the required Firebase and Gemini configuration.

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id

GEMINI_API_KEY=your_gemini_api_key
```

Do not commit your actual API keys to GitHub.

---

## 🎯 Project Goal

TripSync is built around one simple idea:

> **TripSync doesn't just create a trip plan. It finds a plan that a group can actually agree on.**

