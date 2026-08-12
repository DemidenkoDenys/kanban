import { Task } from '@kanban/models/kanban-task.model';
import { Neighbours } from '@kanban/models/kanban-neighboars.model';
import { ColumnEnums, Columns } from '@kanban/models/kanban-column.model';

export type KanbanStatus = 'columns' | 'tasks';

export interface KanbanState {
  columns: Columns;
  columnsOrder: Array<ColumnEnums>;
  neighbours: Neighbours;
  isLoading: KanbanStatus | null;
  error: { status: KanbanStatus; error: string } | null;
}

export const kanbanState = (
  columns: Columns = {},
  columnsOrder: Array<ColumnEnums> = [],
  neighbours: Neighbours = {},
): KanbanState => {
  return {
    columns,
    columnsOrder,
    neighbours,
    isLoading: null,
    error: null,
  };
};
