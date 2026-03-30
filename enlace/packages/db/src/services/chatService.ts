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