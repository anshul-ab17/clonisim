# Enlazar

A real-time chat application built on a Turborepo monorepo.

---

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript (strict) |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| REST + GraphQL | Express 5, Apollo Server 4 |
| Realtime | WebSocket (`ws`) |
| State management | Zustand 5 |
| Database | Neo4j (graph) |
| Infrastructure | Docker Compose |

---

## Structure

```
enlace/
├── apps/
│   ├── api        → Express REST + Apollo GraphQL + WebSocket  (port 3003)
│   ├── server     → (reserved for future use)
│   └── web        → Next.js frontend                           (port 3000)
└── packages/
    ├── db         → Neo4j client + services
    ├── shared     → shared types + utils
    ├── ui         → React component library
    ├── typescript-config
    └── eslint-config
```

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 18
- pnpm 9
- Docker

### 2. Start Neo4j

```bash
docker compose up -d
```

Neo4j browser available at `http://localhost:7474` (user: `neo4j`, password: `password`).

### 3. Environment variables

Each app reads from its own `.env`. Copy the root `.env` into each app directory, or symlink it:

```bash
cp .env apps/api/.env
cp .env apps/server/.env
```

Root `.env`:
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

Optional web env (`apps/web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=ws://localhost:3003
```

### 4. Install dependencies

```bash
pnpm install
```

### 5. Build packages

```bash
pnpm build --filter=@repo/db --filter=@repo/shared
```

### 6. Run

```bash
pnpm dev
```

Or run individually:

```bash
# terminal 1
cd apps/api && pnpm start:dev

# terminal 2
cd apps/web && pnpm dev
```

---

## REST API

Base URL: `http://localhost:3003`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | /users | `{ name }` | Create user |
| GET | /users/:id | — | Get user |
| GET | /chats | — | List all rooms |
| POST | /chats | `{ name }` | Create room |
| POST | /chats/:chatId/join | `{ userId }` | Join room |
| GET | /messages/:chatId | — | Get messages |

---

## GraphQL

Endpoint: `http://localhost:3003/graphql`

```graphql
type Query {
  user(id: ID!): User
  rooms: [Room!]!
  messages(chatId: ID!): [Message!]!
}

type Mutation {
  createUser(name: String!): User!
  createRoom(name: String!): Room!
  joinRoom(userId: ID!, chatId: ID!): Boolean!
}
```

---

## WebSocket Protocol

Connect to `ws://localhost:3003` (same port as HTTP).

### Client → Server

```json
{ "type": "join", "chatId": "...", "userId": "..." }
```

```json
{ "type": "message", "chatId": "...", "userId": "...", "userName": "...", "content": "..." }
```

### Server → Client

```json
{
  "type": "message",
  "payload": {
    "id": "...",
    "content": "...",
    "createdAt": "...",
    "userId": "...",
    "userName": "..."
  }
}
```

---

## Database Schema (Neo4j)

### Nodes

| Label | Properties |
|---|---|
| User | `id`, `name` |
| ChatRoom | `id`, `name` |
| Message | `id`, `content`, `createdAt` |

### Relationships

```
(User)-[:MEMBER_OF]->(ChatRoom)
(User)-[:SENT]->(Message)
(Message)-[:IN]->(ChatRoom)
```

---

## Architecture

```
Browser
  ├── REST / GraphQL ──→ apps/api ──→ packages/db ──→ Neo4j
  └── WebSocket      ──┘  (same port 3003)
```

### State Management (Zustand)

| Store | State |
|---|---|
| `useUserStore` | `user` — persisted to localStorage |
| `useChatStore` | `rooms`, `currentRoom`, `messages` |

---

## Phases

| Phase | Status |
|---|---|
| 0 — Planning | done |
| 1 — Monorepo setup | done |
| 2 — Database layer | done |
| 3 — Services layer | done |
| 4 — Realtime server | done |
| 5 — API server | done |
| 6 — Frontend | done |
| 7 — Authentication | pending |
| 8 — Deployment | pending |
| 9 — Scaling (Redis) | pending |
| 10 — Event driven (Kafka) | pending |
| 11 — Hybrid DB (PostgreSQL) | pending |
| 12 — Advanced features | pending |
