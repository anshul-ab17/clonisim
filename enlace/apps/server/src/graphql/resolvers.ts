import { UserService, ChatService, MessageService } from "@repo/db";
import { v4 as uuidv4 } from "uuid";

const userService = new UserService();
const chatService = new ChatService();
const messageService = new MessageService();

export const resolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }) => userService.getUser(id),
    rooms: () => chatService.getRooms(),
    messages: (_: unknown, { chatId }: { chatId: string }) =>
      messageService.getMessages(chatId),
  },

  Mutation: {
    createUser: (_: unknown, { name }: { name: string }) => {
      const id = uuidv4();
      return userService.createUser(id, name);
    },
    createRoom: (_: unknown, { name }: { name: string }) =>
      chatService.createChannel(name),
    joinRoom: async (
      _: unknown,
      { userId, chatId }: { userId: string; chatId: string }
    ) => {
      await chatService.joinRoom(userId, chatId);
      return true;
    },
  },
};
