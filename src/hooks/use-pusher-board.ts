"use client";

import { useEffect } from "react";
import { getPusherClient, boardChannel, PusherEvents } from "@/lib/pusher";

interface UsePusherBoardArgs {
  boardId: string;
  onTaskCreated: (payload: any) => void;
  onTaskUpdated: (payload: any) => void;
  onTaskMoved: (payload: any) => void;
  onTaskDeleted: (payload: any) => void;
}

export function usePusherBoard({
  boardId,
  onTaskCreated,
  onTaskUpdated,
  onTaskMoved,
  onTaskDeleted,
}: UsePusherBoardArgs) {
  useEffect(() => {
    const client = getPusherClient();
    if (!client) return;

    const channel = client.subscribe(boardChannel(boardId));
    channel.bind(PusherEvents.TASK_CREATED, onTaskCreated);
    channel.bind(PusherEvents.TASK_UPDATED, onTaskUpdated);
    channel.bind(PusherEvents.TASK_MOVED, onTaskMoved);
    channel.bind(PusherEvents.TASK_DELETED, onTaskDeleted);

    return () => {
      channel.unbind_all();
      client.unsubscribe(boardChannel(boardId));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);
}
