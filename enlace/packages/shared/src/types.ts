
export type WSMessage =
  | { type: "join"; chatId: string }
  | { type: "message"; chatId: string; content: string };