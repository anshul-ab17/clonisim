import { WebSocket } from "ws";

interface RoomConnection {
  ws: WebSocket;
  userId: string;
  name: string;
}

// chatId → set of connected clients
const rooms = new Map<string, Set<RoomConnection>>();

export function joinRoom(chatId: string, conn: RoomConnection): void {
  if (!rooms.has(chatId)) rooms.set(chatId, new Set());
  rooms.get(chatId)!.add(conn);
}

export function leaveRoom(chatId: string, ws: WebSocket): RoomConnection | undefined {
  const conns = rooms.get(chatId);
  if (!conns) return undefined;

  let removed: RoomConnection | undefined;
  for (const conn of conns) {
    if (conn.ws === ws) {
      removed = conn;
      conns.delete(conn);
      break;
    }
  }

  if (conns.size === 0) rooms.delete(chatId);
  return removed;
}

export function leaveAllRooms(ws: WebSocket): { chatId: string; conn: RoomConnection }[] {
  const left: { chatId: string; conn: RoomConnection }[] = [];

  for (const [chatId, conns] of rooms.entries()) {
    for (const conn of conns) {
      if (conn.ws === ws) {
        conns.delete(conn);
        left.push({ chatId, conn });
        break;
      }
    }
    if (conns.size === 0) rooms.delete(chatId);
  }

  return left;
}

export function broadcast(
  chatId: string,
  payload: unknown,
  exclude?: WebSocket
): number {
  const conns = rooms.get(chatId);
  if (!conns) return 0;

  const data = JSON.stringify(payload);
  let count = 0;

  for (const { ws } of conns) {
    if (ws !== exclude && ws.readyState === ws.OPEN) {
      ws.send(data);
      count++;
    }
  }

  return count;
}

export function getRoomSize(chatId: string): number {
  return rooms.get(chatId)?.size ?? 0;
}
