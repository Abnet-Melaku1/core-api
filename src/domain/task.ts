export type TaskBase = { id: string; title: string };

export type DraftTask = TaskBase & { status: "draft" };
export type ActiveTask = TaskBase & { startedAt: Date } & { status: "active" };
export type DoneTask = TaskBase & {
  startedAt: Date;
  completedAt: Date;
} & { status: "done" };
export type ArchivedTask = TaskBase & {
  startedAt: Date;
  completedAt: Date;
  archivedAt: Date;
} & { status: "archived" };

export type Task = DraftTask | ActiveTask | DoneTask | ArchivedTask;

export const createTask = (id: string, title: string): DraftTask => {
  return { id, title, status: "draft" };
};

export const start = (task: DraftTask, at: Date): ActiveTask => {
  return { ...task, startedAt: at, status: "active" };
};
export const complete = (task: ActiveTask, at: Date): DoneTask => {
  return { ...task, completedAt: at, status: "done" };
};
export const archive = (task: DoneTask, at: Date): ArchivedTask => {
  return { ...task, archivedAt: at, status: "archived" };
};
const t = createTask("t1", "Write tests");
console.log(archive(complete(start(t, new Date()), new Date()), new Date()));
