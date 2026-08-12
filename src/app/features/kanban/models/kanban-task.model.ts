import { shortUid } from '@shared/utils/short-if.util';
import { getUniqueId } from '@shared/utils/unique-id.util';

export interface Task {
  id: number;
  uid: string;
  done: boolean;
  progress: number;
  description: string;
  tasksOrder?: Array<string>;
  tasks?: Tasks;
}

export type Tasks = Record<string, Task>;
export type TaskList = Array<Task>;
export type TaskChild = { tasks?: Tasks; tasksOrder?: Array<string> };

export const getTask = (ID: number | null, overrides: Partial<Task> = {}): Task => {
  const id = ID ?? getUniqueId();

  return {
    id,
    uid: 'task_' + id,
    done: false,
    progress: 100,
    description: '',
    tasksOrder: [],
    tasks: {},
    ...overrides,
  };
};
