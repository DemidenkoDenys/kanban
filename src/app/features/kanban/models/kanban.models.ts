export const ColumnEnum = {
  backlog: 'backlog',
  todo: 'todo',
  ongoing: 'ongoing',
  done: 'done',
} as const;
export type ColumnEnums = keyof typeof ColumnEnum;

export class Task {
  id = Math.random().toString(36).substring(2, 9);
  progress?: number;
  description = '';
  tasksOrder?: Array<string>;
  tasks?: Tasks;
  done?: boolean;

  constructor(description = '') {
    Object.assign(this, { description });
  }
}

export type Tasks = Partial<Record<string, Task | null>>;

export interface Column {
  id: string;
  name: ColumnEnums;
  tasks?: Tasks;
  tasksOrder?: Array<string>;
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
