import PusherServer from "pusher";
import PusherClient from "pusher-js";

declare global {
  // eslint-disable-next-line no-var
  var pusherClientInstance: PusherClient | undefined;
}

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
  useTLS: true,
});

export function getPusherClient() {
  if (typeof window === "undefined") return null;

  if (!global.pusherClientInstance) {
    global.pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || "",
      { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2" }
    );
  }
  return global.pusherClientInstance;
}

// Channel + event naming helpers, used by both API routes and client hooks
export const boardChannel = (boardId: string) => `board-${boardId}`;

export const PusherEvents = {
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_MOVED: "task:moved",
  TASK_DELETED: "task:deleted",
} as const;
