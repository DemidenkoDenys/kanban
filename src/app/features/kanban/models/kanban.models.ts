import { Record } from 'immutable';
import { Task } from './kanban-task.model';
import { Column, ColumnEnum, ColumnEnums, columns, Columns } from './kanban-column.model';
import { Neighbours } from './kanban-neighboars.model';
import { getNeighbours } from '@kanban/utils/kanban.utils';

export type KanbanPath = Array<string | ColumnEnums>;

export interface IKanban {
  columns: Columns;
  columnsOrder: Array<ColumnEnums>;
  neighbours: Neighbours | null;
}

export const KanbanFactory = Record<IKanban>({ columns, columnsOrder: [], neighbours: null });

export class Kanban extends KanbanFactory implements IKanban {
  public init(columns: Columns, columnsOrder: Array<ColumnEnums>): Kanban {
    return this.set('columns', columns).set('columnsOrder', columnsOrder).updatedNeighbours();
  }

  public addNewTask(description: string): Kanban {
    const column = ColumnEnum.backlog;
    const newTask = new Task({ description });
    return this.update('columns', (columns: any) => {
      return columns.update(column, (col: Column) => col.addTask(newTask));
    }).updatedNeighbours();
  }

  public insertTask(column: ColumnEnums, task: Task, index?: number): Kanban {
    return this.update('columns', (cols: any) =>
      cols.update(column, (col: Column) => col.addTask(task, index)),
    );
  }

  public removeTask(column: ColumnEnums, task: Task, withNeighbours = false): Kanban {
    const kanban2 = this.updateIn(['columns', column], (col: any) => col.removeTask(task.uid));
    return withNeighbours ? kanban2.updatedNeighbours() : kanban2;
  }

  public moveTask(from: ColumnEnums, to: ColumnEnums, task: Task, index?: number): Kanban {
    const kanban2 = this.removeTask(from, task);
    return kanban2.insertTask(to, task, index).updatedNeighbours();
  }

  public updateSubtask(column: ColumnEnums, tasksChain: Array<Task>): Kanban {
    return this.updateIn(['columns', column], (col: any) => col.updateSubtask(tasksChain));
  }

  private updatedNeighbours(): Kanban {
    const neighbours = getNeighbours(this);
    return this.set('neighbours', neighbours);
  }
}
