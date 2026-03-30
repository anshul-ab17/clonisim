import { Neo4jClient } from "./client.js";

export class UserService {
  constructor(private db: Neo4jClient) {}

  async createUser(id: string, name: string) {
    const session = this.db.getSession();

    await session.run(
      `
      CREATE (u:User {id: $id, name: $name})
      `,
      { id, name }
    );

    await session.close();
  }
}