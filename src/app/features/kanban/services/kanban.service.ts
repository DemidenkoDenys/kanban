import { inject, Injectable, signal } from '@angular/core';
import { kanban } from '@kanban/data/kanban';
import { KanbanUndoService } from '@kanban/services/kanbar-undo.service';

import {
  Task,
  Kanban,
  Direction,
  ColumnEnum,
  Neighbours,
  ColumnEnums,
} from '@kanban/models/kanban.models';

import {
  toAddedTask,
  toMovedTask,
  toRemovedTask,
  getNeighbours,
  getTaskColumn,
  toUpdatedSubtask,
  toCalculatedProgress,
} from '@kanban/utils/kanban.utils';

@Injectable()
export class KanbanStoreService {
  public kanban = signal<Kanban>(kanban);
  public neighbours = signal<Neighbours>(getNeighbours(kanban));
  public undoService = inject(KanbanUndoService);
  public isUndoPossible = this.undoService.isUndoPossible;
  public isRedoPossible = this.undoService.isRedoPossible;

  public addTask(description: string): void {
    this.undoService.addAction(this.kanban());
    this.kanban.update((kanban) => toAddedTask(kanban, ColumnEnum.backlog, new Task(description)));
    this.updateNeighbours(this.kanban());
  }

  public moveTask(task: Task, from: ColumnEnums, to: ColumnEnums | null, index?: number): void {
    if (task && from && to) {
      this.undoService.addAction(this.kanban());
      this.kanban.update((kanban) => toMovedTask(kanban, task, from, to, index));
      this.updateNeighbours(this.kanban());
    }
  }

  public moveNext(task: Task | null): void {
    const column = getTaskColumn(this.kanban(), task?.id) ?? null;
    if (column && task) {
      const columns = this.kanban().columnsOrder;
      const nextIndex = columns.indexOf(column) + 1;
      const nextColumn = nextIndex ? columns[nextIndex] : null;
      this.moveTask(task, column, nextColumn);
    }
  }

  public moveBack(task: Task | null): void {
    const column = getTaskColumn(this.kanban(), task?.id) ?? null;
    if (column && task) {
      const columns = this.kanban().columnsOrder;
      const index = columns.indexOf(column);
      const indexPrev = index > 0 ? index - 1 : null;
      const columnPrev = indexPrev !== null ? columns[indexPrev] : null;
      this.moveTask(task, column, columnPrev);
    }
  }

  public removeTask(taskId: string | null): void {
    const column = getTaskColumn(this.kanban(), taskId) ?? null;
    if (column && taskId) {
      this.undoService.addAction(this.kanban());
      this.kanban.update((kanban) => toRemovedTask(kanban, column, taskId));
      this.updateNeighbours(this.kanban());
    }
  }

  public undoAction(): void {
    const lastKanban = this.undoService.undoAction(this.kanban());
    if (lastKanban) {
      this.updateNeighbours(lastKanban);
      this.kanban.update(() => lastKanban);
    }
  }

  public redoAction(): void {
    const lastKanban = this.undoService.redoAction();
    if (lastKanban) {
      this.updateNeighbours(lastKanban);
      this.kanban.update(() => lastKanban);
    }
  }

  public updateSubtask(column: ColumnEnums, tasksChain: Array<Task>): void {
    if (!column || !tasksChain?.length) return;
    this.kanban.update((kanban) => {
      const kanban2 = toUpdatedSubtask(kanban, column, tasksChain);
      return toCalculatedProgress(kanban2, column, tasksChain[0].id);
    });
  }

  public getNeighborTaskId = (task: Task | null, direction: Direction): string | null => {
    return task ? this.neighbours()[task.id][direction] : null;
  };

  private updateNeighbours(kanban: Kanban): void {
    this.neighbours.set(getNeighbours(kanban));
  }
}
