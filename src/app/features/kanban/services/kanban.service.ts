import { computed, inject, Injectable, signal } from '@angular/core';
import { omit } from 'lodash-es';
import { kanban } from '@kanban/data/kanban';
import { KanbanUndoService } from '@kanban/services/kanbar-undo.service';
import { Kanban, Task, ColumnEnums, ColumnEnum } from '@kanban/models/kanban.models';
import {
  toAddedTask,
  toMovedTask,
  toRemovedTask,
  toUpdatedSubtask,
  toCalculatedProgress,
} from '@kanban/utils/kanban.utils';

@Injectable()
export class KanbanStoreService {
  public kanban = signal<Kanban>(kanban);
  public columns = computed(() => omit(this.kanban()));
  public undoService = inject(KanbanUndoService);
  public isUndoPossible = this.undoService.isUndoPossible;
  public isRedoPossible = this.undoService.isRedoPossible;

  public addTask(description: string): void {
    this.kanban.update((kanban) => {
      this.undoService.addAction(kanban);
      return toAddedTask(kanban, ColumnEnum.backlog, new Task(description));
    });
  }

  public moveTask(task: Task, from: ColumnEnums, to: ColumnEnums | null, index?: number): void {
    if (task && from && to) {
      this.kanban.update((kanban) => {
        return toMovedTask(kanban, task, from, to, index);
      });
    }
  }

  public moveNext(column: ColumnEnums | null, task: Task | null): void {
    if (task && column) {
      const columns = this.kanban().columnsOrder;
      const nextIndex = columns.indexOf(column) + 1;
      const nextColumn = nextIndex ? columns[nextIndex] : null;
      this.moveTask(task, column, nextColumn);
    }
  }

  public moveBack(column: ColumnEnums | null, task: Task | null): void {
    if (task && column) {
      const columns = this.kanban().columnsOrder;
      const index = columns.indexOf(column);
      const indexPrev = index > 0 ? index - 1 : null;
      const columnPrev = indexPrev !== null ? columns[indexPrev] : null;
      this.moveTask(task, column, columnPrev);
    }
  }

  public removeTask(column: ColumnEnums | null, taskId: string | null): void {
    if (column && taskId) {
      this.kanban.update((kanban) => {
        this.undoService.addAction(kanban);
        return toRemovedTask(kanban, column, taskId);
      });
    }
  }

  public undoAction(): void {
    const lastKanban = this.undoService.undoAction(this.kanban());
    if (lastKanban) {
      this.kanban.update(() => lastKanban);
    }
  }

  public redoAction(): void {
    const lastKanban = this.undoService.redoAction();
    if (lastKanban) {
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
}
