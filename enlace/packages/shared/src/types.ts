export type User = {
  id: string;
  name: string;
};

export type RoomType = "global" | "channel" | "dm";

export type Room = {
  chatId: string;
  name: string;
  type: RoomType;
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
};

export type Friend = {
  id: string;
  name: string;
};

export type FriendRequest = {
  from: User;
  to: User;
};

export type WSMessage =
  | { type: "join"; chatId: string }
  | { type: "message"; chatId: string; userId: string; userName: string; content: string }
  | { type: "call-offer"; targetUserId: string; offer: RTCSessionDescriptionInit; callType: "audio" | "video" }
  | { type: "call-answer"; targetUserId: string; answer: RTCSessionDescriptionInit }
  | { type: "call-reject"; targetUserId: string }
  | { type: "call-end"; targetUserId: string }
  | { type: "ice-candidate"; targetUserId: string; candidate: RTCIceCandidateInit };

export type WSServerMessage =
  | { type: "message"; payload: Message }
  | { type: "call-offer"; fromUserId: string; offer: RTCSessionDescriptionInit; callType: "audio" | "video" }
  | { type: "call-answer"; fromUserId: string; answer: RTCSessionDescriptionInit }
  | { type: "call-reject"; fromUserId: string }
  | { type: "call-end"; fromUserId: string }
  | { type: "ice-candidate"; fromUserId: string; candidate: RTCIceCandidateInit };
