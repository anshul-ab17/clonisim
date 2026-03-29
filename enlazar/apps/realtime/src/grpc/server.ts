import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { broadcast } from "../rooms";
import { joinRoom as dbJoinRoom } from "@enlazar/db";

const PROTO_PATH = path.resolve(__dirname, "../../../../../proto/enlazar.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proto = grpc.loadPackageDefinition(packageDef) as any;

// ─── RPC Handlers ─────────────────────────────────────────────────────────────

function broadcastMessage(
  call: grpc.ServerUnaryCall<
    {
      message_id: string;
      chat_id: string;
      author_id: string;
      author_name: string;
      content: string;
      created_at: string;
    },
    unknown
  >,
  callback: grpc.sendUnaryData<{ success: boolean; delivered_to: number }>
): void {
  const { message_id, chat_id, author_id, author_name, content, created_at } = call.request;

  const deliveredTo = broadcast(chat_id, {
    type: "message",
    chatId: chat_id,
    payload: {
      id: message_id,
      content,
      createdAt: created_at,
      authorId: author_id,
      authorName: author_name,
    },
  });

  callback(null, { success: true, delivered_to: deliveredTo });
}

function notifyJoinRoom(
  call: grpc.ServerUnaryCall<{ user_id: string; name: string; chat_id: string }, unknown>,
  callback: grpc.sendUnaryData<{ success: boolean }>
): void {
  const { user_id, chat_id } = call.request;

  dbJoinRoom(user_id, chat_id)
    .then(() => callback(null, { success: true }))
    .catch((err) => {
      console.error("[grpc] notifyJoinRoom error:", err);
      callback(null, { success: false });
    });
}

// ─── Server Bootstrap ──────────────────────────────────────────────────────────

export function startGrpcServer(): void {
  const port = process.env.GRPC_PORT ?? "50051";
  const server = new grpc.Server();

  server.addService(proto.enlazar.RealtimeService.service, {
    BroadcastMessage: broadcastMessage,
    NotifyJoinRoom: notifyJoinRoom,
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error("[grpc] Failed to bind:", err);
        return;
      }
      console.log(`[grpc] Realtime gRPC server listening on port ${boundPort}`);
    }
  );
}
