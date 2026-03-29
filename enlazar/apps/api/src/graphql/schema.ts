export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
  }

  type ChatRoom {
    id: ID!
    name: String!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    authorId: ID!
    authorName: String!
    chatId: ID!
  }

  type MessagesResult {
    messages: [Message!]!
    total: Int!
    hasMore: Boolean!
  }

  type Query {
    users: [User!]!
    chats: [ChatRoom!]!
    messages(chatId: ID!, limit: Int, skip: Int): MessagesResult!
    me: User
  }

  type Mutation {
    sendMessage(chatId: ID!, content: String!): Message!
    joinRoom(chatId: ID!): ChatRoom!
    createRoom(name: String!): ChatRoom!
  }
`;
