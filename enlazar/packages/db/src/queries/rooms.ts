import { ChatRoom } from "@enlazar/shared";
import { runQuery } from "../driver";

export async function listRooms(): Promise<ChatRoom[]> {
  const rows = await runQuery<{ r: ChatRoom }>("MATCH (r:ChatRoom) RETURN r");
  return rows.map((row) => row.r);
}

export async function findRoomById(id: string): Promise<ChatRoom | null> {
  const rows = await runQuery<{ r: ChatRoom }>(
    "MATCH (r:ChatRoom {id: $id}) RETURN r",
    { id }
  );
  return rows[0]?.r ?? null;
}

export async function createRoom(id: string, name: string): Promise<ChatRoom> {
  const rows = await runQuery<{ r: ChatRoom }>(
    `MERGE (r:ChatRoom {id: $id})
     ON CREATE SET r.name = $name, r.createdAt = datetime()
     RETURN r`,
    { id, name }
  );
  return rows[0]!.r;
}

export async function joinRoom(userId: string, chatId: string): Promise<void> {
  await runQuery(
    `MATCH (u:User {id: $userId}), (r:ChatRoom {id: $chatId})
     MERGE (u)-[:MEMBER_OF]->(r)`,
    { userId, chatId }
  );
}

export async function leaveRoom(userId: string, chatId: string): Promise<void> {
  await runQuery(
    `MATCH (u:User {id: $userId})-[rel:MEMBER_OF]->(r:ChatRoom {id: $chatId})
     DELETE rel`,
    { userId, chatId }
  );
}

export async function getUserRooms(userId: string): Promise<ChatRoom[]> {
  const rows = await runQuery<{ r: ChatRoom }>(
    `MATCH (u:User {id: $userId})-[:MEMBER_OF]->(r:ChatRoom)
     RETURN r`,
    { userId }
  );
  return rows.map((row) => row.r);
}
