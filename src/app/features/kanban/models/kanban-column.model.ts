import { List, Map, Record } from 'immutable';
import { Task, Tasks } from './kanban-task.model';
import { isNil } from 'lodash-es';
import { calculateProgress, updateShallowDeep } from '@kanban/utils/kanban.utils';

export const ColumnEnum = {
  backlog: 'backlog',
  todo: 'todo',
  ongoing: 'ongoing',
  done: 'done',
} as const;
export type ColumnEnums = keyof typeof ColumnEnum;

interface ColumnProps {
  id: string;
  name: ColumnEnums;
  tasks: Map<string, Task>;
  tasksOrder: List<string>;
}

const ColumnRecordFactory = Record<ColumnProps>({
  id: '',
  name: ColumnEnum.backlog,
  tasks: Map(),
  tasksOrder: List(),
});

export class Column extends ColumnRecordFactory implements ColumnProps {
  constructor(id: number, column: ColumnEnums) {
    super({
      id: `col_${id}`,
      name: column,
    });
  }

  addTask(task: Task, index?: number): Column {
    return this.setIn(['tasks', task.uid], task).updateIn(['tasksOrder'], (o) => {
      const order = (o as List<string>) ?? List<string>();
      return order.insert(index ?? order.size ?? 0, task.uid);
    });
  }

  getTask(id?: string | number): Task | null {
    if (isNil(id)) return null;
    const taskId = isNaN(+id) ? id : `task_${id}`;
    return this.getIn(['tasks', taskId]) as Task;
  }

  updateTask(uid: string, data: Partial<Task>): Column {
    return this.updateIn(['tasks', uid], (task: any) => ({ ...task, ...data }));
  }

  removeTask(taskId: string): Column {
    return this.updateIn(['tasks'], (tasks: any) => tasks.delete(taskId)).updateIn(
      ['tasksOrder'],
      (order: any) => order.filter((id: string) => id !== taskId),
    );
  }

  updateSubtask(tasksChain: Array<Task>): Column {
    const [task, ...subtasks] = tasksChain;

    if (!subtasks.at(-1)) {
      return this;
    }

    const subtabsPath = subtasks.map((task) => ['tasks', task.uid]).flat();
    return this.updateIn(['tasks', task.uid], (task: any) => {
      const task2 = updateShallowDeep<Task>(task, subtabsPath, subtasks.at(-1));
      return { ...task2, progress: calculateProgress(task2.tasks).progress };
    });
  }
}

export type Columns = Map<ColumnEnums, Column>;
export const columns: Map<ColumnEnums, Column> = Map();
