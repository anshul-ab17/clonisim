import { Neo4jClient } from "../client.js";

export class UserService {
  private db = Neo4jClient.getInstance();

  async createUser(id: string, name: string, hashedPassword?: string) {
    const session = this.db.getSession();

    await session.run(
      `
      MERGE (u:User {id: $id})
      SET u.name = $name, u.password = $password
      RETURN u
      `,
      { id, name, password: hashedPassword ?? "" }
    );

    await session.close();

    return { id, name };
  }

  async getUserByName(name: string) {
    const session = this.db.getSession();

    const res = await session.run(
      `MATCH (u:User {name: $name}) RETURN u`,
      { name }
    );

    await session.close();

    return res.records[0]?.get("u")?.properties as
      | { id: string; name: string; password: string }
      | undefined;
  }

  async updateProfile(id: string, bio: string) {
    const session = this.db.getSession();
    await session.run(`MATCH (u:User {id: $id}) SET u.bio = $bio`, { id, bio });
    await session.close();
    return { id, bio };
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