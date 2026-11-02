export type UserId = string & { readonly __brand: "UserId" };
export type TaskId = string & { readonly __brand: "TaskId" };

export const toUserId = (raw: string): UserId => {
  if (raw.length === 0) {
    throw new Error("UserId cannot be empty");
  }

  return raw as UserId;
};

export const toTaskId = (raw: string): TaskId => {
  if (raw.length === 0) {
    throw new Error("TaskId cannot be empty");
  }
  return raw as TaskId;
};
