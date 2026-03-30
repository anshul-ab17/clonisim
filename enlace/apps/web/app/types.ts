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
