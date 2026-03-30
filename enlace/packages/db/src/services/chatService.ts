import { Neo4jClient } from "../client.js";

export class ChatService {
  private db = Neo4jClient.getInstance();

  async createRoom(chatId: string, name: string) {
    const session = this.db.getSession();

    await session.run(
      `
      MERGE (c:ChatRoom {id: $chatId})
      SET c.name = $name
      `,
      { chatId, name }
    );

    await session.close();

    return { chatId, name };
  }

  async getRooms() {
    const session = this.db.getSession();
    const res = await session.run("MATCH (c:ChatRoom) RETURN c");
    await session.close();
    return res.records.map((r) => {
      const props = r.get("c").properties as { id: string; name: string };
      return { chatId: props.id, name: props.name };
    });
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
}