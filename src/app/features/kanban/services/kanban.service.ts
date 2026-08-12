import { inject, Injectable } from '@angular/core';

import { Task } from '@kanban/models/kanban-task.model';
import { Direction } from '@shared/models/direction.model';
import { KanbanStore } from '@kanban/store/kanban.store';
import { HttpService } from '@shared/services/http.service';
import { ColumnEnums } from '@kanban/models/kanban-column.model';
import { WithUndoRedo } from '../decorators/kanban-undo.decorator';
import { getTaskColumn } from '@kanban/utils/kanban.utils';
import { KanbanUndoService } from '@kanban/services/kanbar-undo.service';

@Injectable()
export class KanbanService {
  public store = inject(KanbanStore);
  public service = inject(HttpService);
  public undoService = inject(KanbanUndoService);
  public isUndoPossible = this.undoService.isUndoPossible;
  public isRedoPossible = this.undoService.isRedoPossible;

  public columns = this.store.columns;
  public columnsOrder = this.store.columnsOrder;
  public columnsLoading = this.store.isColumnsLoading;
  public tasksLoading = this.store.isTasksLoading;

  constructor() {
    this.store.load();
  }

  @WithUndoRedo()
  public addTask(description: string): void {
    this.store.addNewTask(description);
  }

  @WithUndoRedo()
  public moveTask(task: Task, from: ColumnEnums, to: ColumnEnums | null, index?: number): void {
    if (task && from && to) {
      this.store.moveTask(from, to, task, index);
    }
  }

  @WithUndoRedo()
  public updateTask(uid: string, data: Partial<Task>): void {
    const column = getTaskColumn(this.store.columns(), uid) ?? null;
    if (column) {
      this.store.updateTask(column, uid, data);
    }
  }

  @WithUndoRedo()
  public removeTask(task: Task | null): void {
    const column = getTaskColumn(this.store.columns(), task?.uid) ?? null;
    if (column && task?.uid) {
      this.store.removeTask(column, task);
    }
  }

  @WithUndoRedo()
  public updateSubtask(column: ColumnEnums, tasksChain: Array<Task>): void {
    this.store.updateSubtask(column, tasksChain);
  }

  public moveNext(task: Task | null): void {
    const order = this.store.columnsOrder();
    const column = getTaskColumn(this.store.columns(), task?.uid) ?? null;

    if (column && task) {
      const nextIndex = order.indexOf(column) + 1;
      const nextColumn = nextIndex ? order[nextIndex] : null;
      this.moveTask(task, column, nextColumn);
    }
  }

  public moveBack(task: Task | null): void {
    const order = this.store.columnsOrder();
    const columns = this.store.columns();
    const column = getTaskColumn(columns, task?.uid) ?? null;

    if (column && task) {
      const index = order.indexOf(column);
      const indexPrev = index > 0 ? index - 1 : null;
      const prevColumn = indexPrev !== null ? order[indexPrev] : null;
      this.moveTask(task, column, prevColumn);
    }
  }

  public undoAction(): void {
    const lastKanban = this.undoService.undoAction(this.store.columns());
    if (lastKanban) {
      this.store.setColumns(lastKanban);
    }
  }

  public redoAction(): void {
    const lastKanban = this.undoService.redoAction();
    if (lastKanban) {
      this.store.setColumns(lastKanban);
    }
  }

  public getNeighborTaskId = (task: Task | null, direction: Direction): string | null => {
    const neighbours = this.store.neighbours();
    return task ? (neighbours ? neighbours[task.uid][direction] : null) : null;
  };
}
