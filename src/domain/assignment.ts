import type { UserId, TaskId } from "./ids.ts";

type Assignment = { userId: UserId; taskId: TaskId };

export const assignTask = (taskId: TaskId, userId: UserId): Assignment => {
  return { taskId, userId };
};
