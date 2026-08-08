export const ColumnEnum = {
  backlog: 'backlog',
  todo: 'todo',
  ongoing: 'ongoing',
  done: 'done',
} as const;
export type Columns = keyof typeof ColumnEnum;

export interface Task {
  id: number;
  rank: string;
  description: string;
  progress?: number;
  subtasks?: Tasks;
  done?: boolean;
}

export type Tasks = Partial<Record<string, Task | null>>;

export interface Column {
  id: number;
  rank: string;
  name: Columns;
  tasks: Tasks;
}

export type Kanban = Partial<Record<Columns, Column>>;

export type KanbanPath =
  | [Columns, 'tasks', string, ...('subtasks' | string)[]]
  | [Columns, 'tasks', string]
  | ['tasks', string, ...('subtasks' | string)[]]
  | ['tasks', string]
  | [string, ...('subtasks' | string)[]]
  | [...('subtasks' | string)[]];

export const KeyboardAction = {
  moveNext: 'moveNext',
  moveBack: 'moveBack',
  delete: 'delete',
  undo: 'undo',
  redo: 'redo',
  _none: '_none',
} as const;
export type KeyboardActions = keyof typeof KeyboardAction;
