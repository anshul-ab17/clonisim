import neo4j, { Driver } from "neo4j-driver";

let _driver: Driver | null = null;

export function getDriver(): Driver {
  if (!_driver) {
    const uri = process.env.NEO4J_URI ?? "bolt://localhost:7687";
    const user = process.env.NEO4J_USER ?? "neo4j";
    const password = process.env.NEO4J_PASSWORD ?? "password";

    _driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
    });
  }
  return _driver;
}

export async function closeDriver(): Promise<void> {
  if (_driver) {
    await _driver.close();
    _driver = null;
  }
}

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getDriver().session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => r.toObject() as T);
  } finally {
    await session.close();
  }
}

export async function initConstraints(): Promise<void> {
  const constraints = [
    "CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
    "CREATE CONSTRAINT room_id IF NOT EXISTS FOR (r:ChatRoom) REQUIRE r.id IS UNIQUE",
    "CREATE CONSTRAINT message_id IF NOT EXISTS FOR (m:Message) REQUIRE m.id IS UNIQUE",
  ];

  for (const cypher of constraints) {
    await runQuery(cypher);
  }

  console.log("[db] Neo4j constraints initialized");
}
