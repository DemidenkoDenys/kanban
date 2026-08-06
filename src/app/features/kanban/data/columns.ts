import { KanbanColumnName } from '@kanban/models/kanban-column.enum';
import { KanbanColumn } from '@kanban/models/kanban-column.models';

export const columns: Array<KanbanColumn> = [
  { id: 1, name: KanbanColumnName.backlog },
  { id: 1, name: KanbanColumnName.todo },
  { id: 1, name: KanbanColumnName.ongoing },
  { id: 1, name: KanbanColumnName.done },
];
