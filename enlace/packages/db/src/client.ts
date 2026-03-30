import neo4j, { Driver } from "neo4j-driver";

export class Neo4jClient {
  private static instance: Neo4jClient;
  private driver: Driver;

  private constructor() {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !user || !password) {
      throw new Error(" Missing Neo4j environment variables");
    }

    this.driver = neo4j.driver(
      uri,
      neo4j.auth.basic(user, password)
    );
  }

  static getInstance() {
    if (!Neo4jClient.instance) {
      Neo4jClient.instance = new Neo4jClient();
    }
    return Neo4jClient.instance;
  }

  getSession() {
    return this.driver.session();
  }

  async close() {
    await this.driver.close();
  }
}