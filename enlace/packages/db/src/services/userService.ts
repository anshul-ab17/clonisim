import { Neo4jClient } from "../client.js";

export class UserService {
  private db = Neo4jClient.getInstance();

  async createUser(id: string, name: string) {
    const session = this.db.getSession();

    await session.run(
      `
      MERGE (u:User {id: $id})
      SET u.name = $name
      RETURN u
      `,
      { id, name }
    );

    await session.close();

    return { id, name };
  }

  async getUser(id: string) {
    const session = this.db.getSession();

    const res = await session.run(
      `
      MATCH (u:User {id: $id})
      RETURN u
      `,
      { id }
    );

    await session.close();

    return res.records[0]?.get("u")?.properties;
  }
}