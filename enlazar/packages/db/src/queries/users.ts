import { User } from "@enlazar/shared";
import { runQuery } from "../driver";

export async function findUserById(id: string): Promise<User | null> {
  const rows = await runQuery<{ u: User }>(
    "MATCH (u:User {id: $id}) RETURN u",
    { id }
  );
  return rows[0]?.u ?? null;
}

export async function findUserByName(name: string): Promise<User | null> {
  const rows = await runQuery<{ u: User }>(
    "MATCH (u:User {name: $name}) RETURN u",
    { name }
  );
  return rows[0]?.u ?? null;
}

export async function createUser(id: string, name: string): Promise<User> {
  const rows = await runQuery<{ u: User }>(
    `MERGE (u:User {id: $id})
     ON CREATE SET u.name = $name, u.createdAt = datetime()
     RETURN u`,
    { id, name }
  );
  return rows[0]!.u;
}

export async function listUsers(): Promise<User[]> {
  const rows = await runQuery<{ u: User }>("MATCH (u:User) RETURN u");
  return rows.map((r) => r.u);
}

export async function getRoomMembers(chatId: string): Promise<User[]> {
  const rows = await runQuery<{ u: User }>(
    `MATCH (u:User)-[:MEMBER_OF]->(r:ChatRoom {id: $chatId})
     RETURN u`,
    { chatId }
  );
  return rows.map((r) => r.u);
}
