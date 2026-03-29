# Enlazar

> **Connect. Converse. Belong.**
> A real-time chat platform inspired by Discord, built on a graph database.

---

## Architecture

```
enlazar/
├── apps/
│   ├── api/        Express REST + Apollo GraphQL  → :4000
│   ├── realtime/   Native WebSocket + gRPC server → :4001 (WS) / :50051 (gRPC)
│   └── web/        React + Vite frontend           → :3000
├── packages/
│   ├── shared/     TypeScript types, WS event contracts, utils
│   └── db/         Neo4j driver + Cypher query layer
└── proto/
    └── enlazar.proto   gRPC service definition (API ↔ Realtime)
```

### Communication flow

```
Browser ──WS──► Realtime Server ──► Neo4j
   │                  ▲
   │                  │ gRPC (BroadcastMessage)
   └──HTTP──► API Server ──────────► Neo4j
```

- REST/GraphQL messages sent via the API are **broadcast to WebSocket clients** through gRPC.
- WebSocket messages are **persisted directly** by the Realtime server.

---

## Graph Data Model (Neo4j)

```
(User)-[:MEMBER_OF]->(ChatRoom)
(User)-[:SENT]------>(Message)
(Message)-[:IN]----->(ChatRoom)
```

**Nodes:** `User {id, name}` · `ChatRoom {id, name}` · `Message {id, content, createdAt}`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (Node.js 18+) |
| REST API | Express 4 |
| GraphQL | Apollo Server 4 |
| Realtime | Native `ws` (WebSocket) |
| Database | Neo4j 5 (graph) |
| Monorepo | pnpm workspaces + Turborepo |
| Inter-service | gRPC (`@grpc/grpc-js`) |
| Frontend | React 18 + Vite + Zustand |

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- pnpm 8+  (`npm i -g pnpm`)
- Docker + Docker Compose (for Neo4j)

### 2. Start Neo4j

```bash
docker compose up -d
```

Neo4j Browser → http://localhost:7474 (user: `neo4j`, password: `password`)

### 3. Seed initial data (optional)

```bash
docker exec -i enlazar-neo4j-1 cypher-shell -u neo4j -p password \
  < scripts/setup-neo4j-seed.cypher
```

### 4. Install dependencies

```bash
pnpm install
```

### 5. Configure environment

```bash
cp .env.example .env
# Edit .env if your Neo4j credentials differ
```

### 6. Run all services

```bash
pnpm dev
```

Or run each individually in separate terminals:

```bash
# Terminal 1 — shared packages (watch mode)
pnpm --filter @enlazar/shared dev
pnpm --filter @enlazar/db dev

# Terminal 2 — API server
pnpm --filter @enlazar/api dev

# Terminal 3 — Realtime server
pnpm --filter @enlazar/realtime dev

# Terminal 4 — Web app
pnpm --filter @enlazar/web dev
```

Open **http://localhost:3000** in your browser.

---

## API Reference

### REST

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Login / register by name, returns JWT |
| GET | `/messages/:chatId` | Bearer | Paginated message history |
| POST | `/messages/:chatId` | Bearer | Send message via REST |
| POST | `/messages/rooms/create` | Bearer | Create a new room |

### GraphQL — http://localhost:4000/graphql

```graphql
query {
  chats { id name }
  messages(chatId: "general", limit: 20) {
    messages { id content createdAt authorName }
    total hasMore
  }
}

mutation {
  sendMessage(chatId: "general", content: "Hello!") { id content }
  joinRoom(chatId: "random") { id name }
  createRoom(name: "design") { id name }
}
```

---

## WebSocket Protocol

Connect to `ws://localhost:4001` and send JSON events:

```jsonc
// Join a room (sends back message history)
{ "type": "join", "chatId": "general", "payload": { "userId": "...", "name": "Alice" } }

// Send a message
{ "type": "message", "chatId": "general", "payload": { "content": "Hi!", "userId": "...", "name": "Alice" } }

// Leave a room
{ "type": "leave", "chatId": "general", "payload": { "userId": "..." } }
```

Server emits: `message` · `history` · `user_joined` · `user_left` · `error`

---

## UI Theme

| Token | Value |
|-------|-------|
| Primary accent | `#800020` (deep burgundy) |
| Background | `#1c1c1c` (charcoal black) |
| Secondary bg | `#202020` |
| Border radius | `6–14px` |
| Font | Inter / Segoe UI / system-ui |

---

## Roadmap (post-V1)

- [ ] PostgreSQL + Prisma for message archival (long-term storage)
- [ ] Direct Messages (DMs)
- [ ] Message reactions & threads
- [ ] File / image uploads
- [ ] Role-based room permissions
- [ ] Voice channels (WebRTC)
