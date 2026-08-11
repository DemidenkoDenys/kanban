import { ColumnEnums } from '@kanban/models/kanban-column.model';

export interface TaskDto {
  id: number;
  taskId?: number;
  column?: ColumnEnums;
  description: string;
  done?: boolean;
}
