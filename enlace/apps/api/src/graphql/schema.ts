export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
  }

  type Room {
    chatId: ID!
    name: String!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    userId: String!
    userName: String!
  }

  type Query {
    user(id: ID!): User
    rooms: [Room!]!
    messages(chatId: ID!): [Message!]!
  }

  type Mutation {
    createUser(name: String!): User!
    createRoom(name: String!): Room!
    joinRoom(userId: ID!, chatId: ID!): Boolean!
  }
`;
