import { KanbanColumnNames } from './kanban-column.enum';

export interface KanbanTask {
  id: number;
  column: KanbanColumnNames;
  description: string;
}
