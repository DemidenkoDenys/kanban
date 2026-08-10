import { shortId } from '@shared/utils/short-if.util';

export const ColumnEnum = {
  backlog: 'backlog',
  todo: 'todo',
  ongoing: 'ongoing',
  done: 'done',
} as const;
export type ColumnEnums = keyof typeof ColumnEnum;

export class Task {
  id = shortId(7);
  done = false;
  progress = 100;
  description = '';
  tasks: Tasks = {};
  tasksOrder: Array<string> = [];
  version = crypto.randomUUID();

  constructor(data?: Partial<Task> | null, id?: number) {
    Object.assign(this, data ?? {});
    if (id) {
      this.id = `task_${id}`;
    }
  }

  static update(task?: Task): Task {
    if (!task) return new Task();
    return new Task({ ...task, version: crypto.randomUUID() });
  }
}

export type Tasks = Partial<Record<string, Task | null>>;

export class Column {
  id = Math.random().toString();
  name: ColumnEnums = ColumnEnum.backlog;
  tasks: Tasks = {};
  tasksOrder: Array<string> = [];

  constructor(id: number, column: ColumnEnums) {
    Object.assign(this, { name: column, id: `col_${id}` });
  }
}

export type Columns = Partial<Record<ColumnEnums, Column>>;

export class Kanban {
  columns: Columns = {};
  columnsOrder: Array<ColumnEnums> = [];
}

export type KanbanPath = Array<string | ColumnEnums>;

// export type KanbanPathSome =
//   | ['columns', ColumnEnums, 'tasksOrder']
//   | ['columns', ColumnEnums, 'tasks', string]
//   | ['columns', ColumnEnums, 'tasks']
//   | [ColumnEnums, 'tasksOrder']
//   | [ColumnEnums, 'tasks', string]
//   | [ColumnEnums, 'tasks']
//   | ['tasksOrder']
//   | ['tasks', string]
//   | ['tasks'];

export const KeyboardAction = {
  focusUp: 'focusUp',
  focusDown: 'focusDown',
  focusLeft: 'focusLeft',
  focusRight: 'focusRight',
  moveNext: 'moveNext',
  moveBack: 'moveBack',
  delete: 'delete',
  undo: 'undo',
  redo: 'redo',
  _none: '_none',
} as const;
export type KeyboardActions = keyof typeof KeyboardAction;

export type Direction = 'left' | 'right' | 'up' | 'down';

export class Neighbour implements Record<Direction, string | null> {
  up: string | null = null;
  down: string | null = null;
  left: string | null = null;
  right: string | null = null;
}
export type Neighbours = Record<string, Neighbour>;
