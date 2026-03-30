import { Neo4jClient } from "../client.js";

export class FriendService {
  private db = Neo4jClient.getInstance();

  async sendRequest(fromId: string, toId: string) {
    const session = this.db.getSession();
    await session.run(
      `
      MATCH (a:User {id: $fromId}), (b:User {id: $toId})
      MERGE (a)-[:SENT_REQUEST]->(b)
      `,
      { fromId, toId }
    );
    await session.close();
    return { fromId, toId };
  }

  async acceptRequest(requesterId: string, acceptorId: string) {
    const session = this.db.getSession();
    await session.run(
      `
      MATCH (a:User {id: $requesterId})-[r:SENT_REQUEST]->(b:User {id: $acceptorId})
      DELETE r
      MERGE (a)-[:FRIENDS_WITH]->(b)
      MERGE (b)-[:FRIENDS_WITH]->(a)
      `,
      { requesterId, acceptorId }
    );
    await session.close();
    return { requesterId, acceptorId };
  }

  async removeFriend(userId: string, friendId: string) {
    const session = this.db.getSession();
    await session.run(
      `
      MATCH (a:User {id: $userId})-[r:FRIENDS_WITH]->(b:User {id: $friendId})
      DELETE r
      WITH a, b
      MATCH (b)-[r2:FRIENDS_WITH]->(a)
      DELETE r2
      `,
      { userId, friendId }
    );
    await session.close();
  }

  async getFriends(userId: string) {
    const session = this.db.getSession();
    const res = await session.run(
      `
      MATCH (u:User {id: $userId})-[:FRIENDS_WITH]->(f:User)
      RETURN f.id as id, f.name as name
      `,
      { userId }
    );
    await session.close();
    return res.records.map((r) => ({
      id: r.get("id") as string,
      name: r.get("name") as string,
    }));
  }

  async getPendingRequests(userId: string) {
    const session = this.db.getSession();
    const res = await session.run(
      `
      MATCH (from:User)-[:SENT_REQUEST]->(to:User {id: $userId})
      RETURN from.id as id, from.name as name
      `,
      { userId }
    );
    await session.close();
    return res.records.map((r) => ({
      id: r.get("id") as string,
      name: r.get("name") as string,
    }));
  }

  async getSentRequests(userId: string) {
    const session = this.db.getSession();
    const res = await session.run(
      `
      MATCH (from:User {id: $userId})-[:SENT_REQUEST]->(to:User)
      RETURN to.id as id, to.name as name
      `,
      { userId }
    );
    await session.close();
    return res.records.map((r) => ({
      id: r.get("id") as string,
      name: r.get("name") as string,
    }));
  }
}
