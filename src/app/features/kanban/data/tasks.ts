import { KanbanColumnName } from '@kanban/models/kanban-column.enum';
import { KanbanTask } from '@kanban/models/kanban-task.model';

export const tasks: Array<KanbanTask> = [
  {
    id: 1,
    description: 'Say hi to Andrea and try not to panic',
    column: KanbanColumnName.todo,
  },
  { id: 2, description: 'Create basic Kanban board layout', column: KanbanColumnName.done },
  { id: 3, description: 'Be on time for the interview', column: KanbanColumnName.ongoing },
  { id: 4, description: 'Complete the interview task', column: KanbanColumnName.ongoing },
  { id: 5, description: 'Push code to repository', column: KanbanColumnName.backlog },
  { id: 6, description: 'Tell about myself', column: KanbanColumnName.backlog },
];
