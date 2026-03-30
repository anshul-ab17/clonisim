import { Neo4jClient } from "../client.js";

export class MessageService {
  private db = Neo4jClient.getInstance();

  async sendMessage(
    messageId: string,
    userId: string,
    chatId: string,
    content: string
  ) {
    const session = this.db.getSession();

    await session.run(
      `
      MATCH (u:User {id: $userId}), (c:ChatRoom {id: $chatId})
      CREATE (m:Message {
        id: $messageId,
        content: $content,
        createdAt: datetime()
      })
      CREATE (u)-[:SENT]->(m)
      CREATE (m)-[:IN]->(c)
      `,
      { messageId, userId, chatId, content }
    );

    await session.close();

    return {
      id: messageId,
      userId,
      chatId,
      content,
    };
  }

  async getMessages(chatId: string) {
    const session = this.db.getSession();

    const res = await session.run(
      `
      MATCH (c:ChatRoom {id: $chatId})<-[:IN]-(m:Message)<-[:SENT]-(u:User)
      RETURN m, u.id as userId, u.name as userName
      ORDER BY m.createdAt ASC
      `,
      { chatId }
    );

    await session.close();

    return res.records.map((r) => ({
      ...(r.get("m").properties as Record<string, unknown>),
      createdAt: String(r.get("m").properties.createdAt ?? ""),
      userId: r.get("userId") as string,
      userName: r.get("userName") as string,
    }));
  }
}