import { Message } from "@enlazar/shared";
import { runQuery } from "../driver";

export async function saveMessage(msg: {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  chatId: string;
}): Promise<Message> {
  const rows = await runQuery<{
    m: { id: string; content: string; createdAt: string };
    authorId: string;
    authorName: string;
    chatId: string;
  }>(
    `MATCH (u:User {id: $userId}), (r:ChatRoom {id: $chatId})
     CREATE (m:Message {id: $id, content: $content, createdAt: $createdAt})
     CREATE (u)-[:SENT]->(m)
     CREATE (m)-[:IN]->(r)
     RETURN m, u.id AS authorId, u.name AS authorName, r.id AS chatId`,
    { id: msg.id, content: msg.content, createdAt: msg.createdAt, userId: msg.userId, chatId: msg.chatId }
  );

  const row = rows[0]!;
  return {
    id: row.m.id,
    content: row.m.content,
    createdAt: row.m.createdAt,
    authorId: row.authorId,
    authorName: row.authorName,
    chatId: row.chatId,
  };
}

export async function getMessages(
  chatId: string,
  limit = 50,
  skip = 0
): Promise<Message[]> {
  const rows = await runQuery<{
    m: { id: string; content: string; createdAt: string };
    authorId: string;
    authorName: string;
  }>(
    `MATCH (m:Message)-[:IN]->(r:ChatRoom {id: $chatId})
     MATCH (u:User)-[:SENT]->(m)
     RETURN m, u.id AS authorId, u.name AS authorName
     ORDER BY m.createdAt ASC
     SKIP $skip LIMIT $limit`,
    { chatId, skip: neo4jInt(skip), limit: neo4jInt(limit) }
  );

  return rows.map((row) => ({
    id: row.m.id,
    content: row.m.content,
    createdAt: row.m.createdAt,
    authorId: row.authorId,
    authorName: row.authorName,
    chatId,
  }));
}

export async function countMessages(chatId: string): Promise<number> {
  const rows = await runQuery<{ count: { low: number } }>(
    `MATCH (m:Message)-[:IN]->(r:ChatRoom {id: $chatId})
     RETURN count(m) AS count`,
    { chatId }
  );
  return rows[0]?.count?.low ?? 0;
}

// Neo4j driver requires integer params via neo4j.int()
function neo4jInt(n: number) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const neo4j = require("neo4j-driver");
  return neo4j.int(n);
}
