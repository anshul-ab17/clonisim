import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { Message } from "@enlazar/shared";

const PROTO_PATH = path.resolve(__dirname, "../../../../proto/enlazar.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto = grpc.loadPackageDefinition(packageDef) as any;

function getClient() {
  const host = process.env.GRPC_HOST ?? "localhost";
  const port = process.env.GRPC_PORT ?? "50051";
  return new proto.enlazar.RealtimeService(
    `${host}:${port}`,
    grpc.credentials.createInsecure()
  );
}

export function broadcastMessage(message: Message): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = getClient();
    client.BroadcastMessage(
      {
        message_id: message.id,
        chat_id: message.chatId,
        author_id: message.authorId,
        author_name: message.authorName,
        content: message.content,
        created_at: message.createdAt,
      },
      (err: grpc.ServiceError | null) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

export function notifyJoinRoom(
  userId: string,
  name: string,
  chatId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = getClient();
    client.NotifyJoinRoom(
      { user_id: userId, name, chat_id: chatId },
      (err: grpc.ServiceError | null) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}
