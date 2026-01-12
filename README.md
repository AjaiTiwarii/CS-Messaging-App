# Customer Support Messaging Web App

A full-stack **Customer Support Messaging System** that allows multiple agents to collaboratively respond to incoming customer queries in real time.

The system supports message ingestion, prioritization, agent assignment, conversation history, canned responses, and a simple customer interface — all **without authentication**, as required.

---

## Features

### Core
- Customer messages via UI or API
- Multiple agents working simultaneously
- Automatic priority detection (LOW / MEDIUM / HIGH)
- Full customer conversation history
- Agent replies with canned responses
- Conversation claiming to avoid conflicts
- Auto-refreshing inbox (real-time via polling)

### UI
- **Landing Page**
  - Enter as **Customer**
  - Enter as **Agent**
- **Customer Flow**
  - Submit queries
  - View full conversation history
- **Agent Flow**
  - Inbox with priority sorting
  - Claim conversations
  - Reply to customers
  - View customer context

---

## Tech Stack

### Backend
- Node.js (v18+)
- TypeScript
- Express
- Prisma ORM
- PostgreSQL (Neon Cloud DB)

### Frontend
- React
- TypeScript
- Vite
- React Router

---

## Project Structure

```
CS-Messaging-App/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── prisma/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

---

## Data Model (Overview)

### Customer
- `id`
- `assignedAgent` (nullable)
- `createdAt`

### Message
- `id`
- `customerId`
- `content`
- `senderType` (`CUSTOMER` | `AGENT`)
- `priority`
- `priorityScore`
- `priorityReason`
- `createdAt`

---

## Setup Instructions (From Scratch)

> Assumes **no prior setup** on the local machine.

---

### Install System Dependencies

#### Install Node.js (v18+)
```bash
sudo apt update
sudo apt install nodejs npm -y
```

Verify:
```bash
node -v
npm -v
```

---

### Clone the Repository

```bash
git clone <your-repo-url>
cd CS-Messaging-App
```

---

## Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://<username>:<password>@<host>/<dbname>?sslmode=require
PORT=4000
```

> Use any PostgreSQL database (Neon recommended).

### Initialize Database (Prisma)

```bash
npx prisma generate
npx prisma migrate dev
```

### (Optional) Import Historical Messages from CSV

```bash
npx ts-node src/utils/importCsv.ts
```

### Start Backend Server

```bash
npm run dev
```

Backend runs at:
```
http://localhost:4000
```

---

## Frontend Setup

### Install Dependencies

```bash
cd ../frontend
npm install
```

### Start Frontend Dev Server

```bash
npm run dev
```

Frontend runs at:
```
http://localhost:5173
```

---

## How to Use the App

### Landing Page

Choose:
- **Enter as Customer**
- **Enter as Agent**

### Customer Flow

1. Enter a customer ID
2. Send new messages
3. View complete conversation history

### Agent Flow

1. Enter agent name (stored locally)
2. View inbox (auto-refresh every 5s)
3. Claim conversations
4. Send replies (manual or canned)
5. See customer context and priority

---

## Message Prioritization

Messages are scored using rule-based NLP:
- Loan / payment / urgency keywords
- Question detection
- Explicit urgency markers

Scores (1–10) are mapped to:
- **LOW**
- **MEDIUM**
- **HIGH**

---

## Multi-Agent Handling

- Conversations are assigned per customer
- Only the assigned agent can reply
- Other agents see the conversation as locked
- Ownership is persisted in the database

---

## Design Decisions

- **Authentication intentionally excluded** (out of scope)
- **Agent identity stored locally** for simplicity
- **Conversation ownership tied to customer**, not individual messages
- Clear separation between:
  - `senderType` → who sent the message
  - `assignedAgent` → who owns the conversation

---
