export class RoomManager {
  private rooms = new Map<string, Set<any>>();

  join(chatId: string, ws: any) {
    if (!this.rooms.has(chatId)) {
      this.rooms.set(chatId, new Set());
    }
    this.rooms.get(chatId)!.add(ws);
  }

  broadcast(chatId: string, message: any) {
    const clients = this.rooms.get(chatId);

    if (!clients) return;

    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  }
}