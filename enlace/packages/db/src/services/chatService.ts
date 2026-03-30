import { Neo4jClient } from "../client.js";
import { v4 as uuidv4 } from "uuid";

const GLOBAL_ROOM_ID = "global";

export class ChatService {
  private db = Neo4jClient.getInstance();

  async getOrCreateGlobal() {
    const session = this.db.getSession();
    await session.run(
      `
      MERGE (c:ChatRoom {id: $id})
      SET c.name = 'Global', c.type = 'global'
      `,
      { id: GLOBAL_ROOM_ID }
    );
    await session.close();
    return { chatId: GLOBAL_ROOM_ID, name: "Global", type: "global" as const };
  }

  async createChannel(name: string) {
    const chatId = uuidv4();
    const session = this.db.getSession();
    await session.run(
      `
      MERGE (c:ChatRoom {id: $chatId})
      SET c.name = $name, c.type = 'channel'
      `,
      { chatId, name }
    );
    await session.close();
    return { chatId, name, type: "channel" as const };
  }

  async getChannels() {
    const session = this.db.getSession();
    const res = await session.run(
      `MATCH (c:ChatRoom) WHERE c.type = 'channel' RETURN c`
    );
    await session.close();
    return res.records.map((r) => {
      const p = r.get("c").properties as { id: string; name: string; type: string };
      return { chatId: p.id, name: p.name, type: p.type };
    });
  }

  async getOrCreateDM(userIdA: string, userIdB: string) {
    const session = this.db.getSession();

    // Check if DM already exists between these two users
    const existing = await session.run(
      `
      MATCH (a:User {id: $userIdA})-[:MEMBER_OF]->(c:ChatRoom {type: 'dm'})<-[:MEMBER_OF]-(b:User {id: $userIdB})
      RETURN c
      `,
      { userIdA, userIdB }
    );

    if (existing.records.length > 0) {
      await session.close();
      const p = existing.records[0]!.get("c").properties as { id: string; name: string };
      return { chatId: p.id, name: p.name, type: "dm" as const };
    }

    const chatId = uuidv4();
    await session.run(
      `
      MATCH (a:User {id: $userIdA}), (b:User {id: $userIdB})
      CREATE (c:ChatRoom {id: $chatId, name: 'dm', type: 'dm'})
      CREATE (a)-[:MEMBER_OF]->(c)
      CREATE (b)-[:MEMBER_OF]->(c)
      `,
      { chatId, userIdA, userIdB }
    );

    await session.close();
    return { chatId, name: "dm", type: "dm" as const };
  }

  async joinRoom(userId: string, chatId: string) {
    const session = this.db.getSession();
    await session.run(
      `
      MATCH (u:User {id: $userId}), (c:ChatRoom {id: $chatId})
      MERGE (u)-[:MEMBER_OF]->(c)
      `,
      { userId, chatId }
    );
    await session.close();
    return { userId, chatId };
  }

  async getRooms() {
    const session = this.db.getSession();
    const res = await session.run(`MATCH (c:ChatRoom) RETURN c`);
    await session.close();
    return res.records.map((r) => {
      const p = r.get("c").properties as { id: string; name: string; type: string };
      return { chatId: p.id, name: p.name, type: p.type };
    });
  }
}
