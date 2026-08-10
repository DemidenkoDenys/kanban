import { ColumnEnums } from '@kanban/models/kanban.models';

export interface TaskDto {
  id: number;
  taskId?: number;
  column?: ColumnEnums;
  description: string;
  done?: boolean;
}
