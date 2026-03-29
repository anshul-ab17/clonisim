// ─── WebSocket Event Protocol ─────────────────────────────────────────────────
//
// All messages exchanged over the WebSocket connection follow this structure.
// Clients send events to the server; the server broadcasts to room members.

export type WsEventType =
  | "join"
  | "leave"
  | "message"
  | "history"
  | "user_joined"
  | "user_left"
  | "error";

// Client → Server
export interface JoinEvent {
  type: "join";
  chatId: string;
  payload: { userId: string; name: string };
}

export interface LeaveEvent {
  type: "leave";
  chatId: string;
  payload: { userId: string };
}

export interface SendMessageEvent {
  type: "message";
  chatId: string;
  payload: { content: string; userId: string; name: string };
}

// Server → Client
export interface BroadcastMessageEvent {
  type: "message";
  chatId: string;
  payload: {
    id: string;
    content: string;
    createdAt: string;
    authorId: string;
    authorName: string;
  };
}

export interface UserJoinedEvent {
  type: "user_joined";
  chatId: string;
  payload: { userId: string; name: string };
}

export interface UserLeftEvent {
  type: "user_left";
  chatId: string;
  payload: { userId: string; name: string };
}

export interface HistoryEvent {
  type: "history";
  chatId: string;
  payload: { messages: BroadcastMessageEvent["payload"][] };
}

export interface WsErrorEvent {
  type: "error";
  payload: { message: string };
}

export type ClientWsEvent = JoinEvent | LeaveEvent | SendMessageEvent;
export type ServerWsEvent =
  | BroadcastMessageEvent
  | UserJoinedEvent
  | UserLeftEvent
  | HistoryEvent
  | WsErrorEvent;
