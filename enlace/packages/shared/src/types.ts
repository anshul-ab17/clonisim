export type User = {
  id: string;
  name: string;
};

export type Room = {
  chatId: string;
  name: string;
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
};

export type WSMessage =
  | { type: "join"; chatId: string; userId: string }
  | { type: "message"; chatId: string; userId: string; userName: string; content: string };

export type WSServerMessage = {
  type: "message";
  payload: Message;
};