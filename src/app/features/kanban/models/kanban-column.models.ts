import { KanbanColumnNames } from './kanban-column.enum';
import { KanbanTask } from './kanban-task.model';

export interface KanbanColumn {
  id: number;
  name: KanbanColumnNames;
}

export type KanbanColumnTasksMap = Record<KanbanColumnNames, Array<KanbanTask>>;
