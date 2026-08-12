import { Task } from './kanban-task.model';

export const ColumnEnum = {
  backlog: 'backlog',
  todo: 'todo',
  ongoing: 'ongoing',
  done: 'done',
} as const;

export type ColumnEnums = keyof typeof ColumnEnum;

export interface Column {
  id: string;
  name: ColumnEnums;
  tasks: Record<string, Task>;
  tasksOrder: Array<string>;
}

export const getColumn = (index: number, column: ColumnEnums): Column => {
  return {
    id: `column_${index}`,
    name: column,
    tasks: {},
    tasksOrder: [],
  };
};

export const getColumns = (columns: Array<ColumnEnums>): Columns => {
  return columns.reduce((acc, column, i) => ({ ...acc, [column]: getColumn(i, column) }), {});
};

export type Columns = Record<string, Column>;

export type KanbanPath = Array<string | ColumnEnums>;
