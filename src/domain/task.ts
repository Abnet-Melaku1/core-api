export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export type TaskBase = { id: string; title: string };

export type DraftTask = TaskBase & { status: "draft" };
export type ActiveTask = TaskBase & { status: "active"; startedAt: Date };
export type DoneTask = TaskBase & {
  status: "done";
  startedAt: Date;
  completedAt: Date;
};
export type ArchivedTask = TaskBase & {
  status: "archived";
  startedAt: Date;
  completedAt: Date;
  archivedAt: Date;
};

export type Task = DraftTask | ActiveTask | DoneTask | ArchivedTask;

export type TaskEvent =
  | { type: "start"; at: Date }
  | { type: "complete"; at: Date }
  | { type: "archive"; at: Date };

export const createTask = (id: string, title: string): DraftTask => {
  return { id, title, status: "draft" };
};

export const start = (task: DraftTask, at: Date): ActiveTask => {
  return { ...task, status: "active", startedAt: at };
};

export const complete = (task: ActiveTask, at: Date): DoneTask => {
  return { ...task, status: "done", completedAt: at };
};

export const archive = (task: DoneTask, at: Date): ArchivedTask => {
  return { ...task, status: "archived", archivedAt: at };
};

function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

export function transition(task: Task, event: TaskEvent): Result<Task> {
  switch (task.status) {
    case "draft":
      if (event.type === "start") {
        return { ok: true, value: start(task, event.at) };
      }
      return { ok: false, error: `cannot ${event.type} a draft task` };

    case "active":
      if (event.type === "complete") {
        return { ok: true, value: complete(task, event.at) };
      }
      return { ok: false, error: `cannot ${event.type} an active task` };

    case "done":
      if (event.type === "archive") {
        return { ok: true, value: archive(task, event.at) };
      }
      return { ok: false, error: `cannot ${event.type} a done task` };

    case "archived":
      return { ok: false, error: `cannot ${event.type} an archived task` };

    default:
      return assertNever(task);
  }
}
