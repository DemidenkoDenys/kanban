import { shortId } from '@shared/utils/short-if.util';

export class Task {
  id: number | null = null;
  uid = shortId(7);
  done = false;
  progress = 100;
  description = '';
  tasks: Tasks = {};
  tasksOrder: Array<string> = [];
  version = crypto.randomUUID();

  constructor(data?: Partial<Task> | null, id?: number) {
    Object.assign(this, data ?? {});
    if (id) {
      this.id = id;
      this.uid = `task_${id}`;
    }
  }
}

export type Tasks = Partial<Record<string, Task | null>>;
