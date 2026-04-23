export type User = { id: string; name: string };

export type RoomType = "global" | "channel" | "dm";

export type Room = { chatId: string; name: string; type: RoomType; participantId?: string };

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
  chatId?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  bio?: string;
};

export type Friend = { id: string; name: string };
