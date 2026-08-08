import { inject, Injectable, signal } from '@angular/core';
import { maxBy } from 'lodash-es';
import { kanban } from '@kanban/data/kanban';
import { rankGenerator } from '@shared/utils/rank-generator.util';
import { KanbanUndoService } from '@kanban/services/kanbar-undo.service';
import { Kanban, Columns, Task, KanbanPath, ColumnEnum } from '@kanban/models/kanban.models';
import { getMaxTaskId, updateShallowDeep, updateTaskProgress } from '@kanban/utils/kanban.utils';

@Injectable()
export class KanbanStoreService {
  public kanban = signal<Kanban>(kanban);
  public undoService = inject(KanbanUndoService);
  public isUndoPossible = this.undoService.isUndoPossible;
  public isRedoPossible = this.undoService.isRedoPossible;

  public addTask(description: string): void {
    const newTask = this.getNewTask(description);

    this.kanban.update((kanban) => {
      const taskId = newTask.id.toString();
      this.undoService.addAction(kanban);
      const path: KanbanPath = [ColumnEnum.backlog, 'tasks', taskId];
      return updateShallowDeep<Kanban>(kanban, path, newTask);
    });
  }

  public moveTo(task: Task, columnTo: Columns, columnFrom: Columns): void {
    const kanban = this.kanban();
    const taskId = task.id.toString();
    const latestTask = kanban[columnTo]
      ? maxBy(Object.values(kanban[columnTo].tasks), 'rank')
      : null;

    const rank = rankGenerator(latestTask?.rank ?? null)();
    const movedTask = { ...task, rank };

    this.kanban.update((kanban) => {
      if (!columnFrom || !columnTo) return kanban;

      this.undoService.addAction(kanban);

      const pathTo: KanbanPath = [columnTo, 'tasks', taskId];
      const pathFrom: KanbanPath = [columnFrom, 'tasks', taskId];

      const kanbanNewTask = updateShallowDeep(kanban, pathTo, movedTask);
      const kanbanUpdated = updateShallowDeep<Kanban>(kanbanNewTask, pathFrom);

      return kanbanUpdated;
    });
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

  public removeTask(taskId: string, column: Columns): void {
    this.kanban.update((kanban) => {
      this.undoService.addAction(kanban);
      return updateShallowDeep<Kanban>(kanban, [column, 'tasks', taskId]);
    });
  }

  public updateSubtask(column: Columns, subtasksChain: Array<Task>): void {
    if (!column || !subtasksChain?.length) return;

    const path: Array<string> = [column];
    const changedSubtask = structuredClone(subtasksChain.at(-1));

    subtasksChain.forEach((task, index) => {
      path.push(index === 0 ? 'tasks' : 'subtasks', task.id.toString());
    });

    this.kanban.update((kanban) => {
      const updatedKanban = updateShallowDeep<Kanban>(kanban, path, changedSubtask);
      return updateTaskProgress(updatedKanban, column, subtasksChain[0].id);
    });
  }

  private getNewTask(description: string): Task {
    const maxId = getMaxTaskId(this.kanban());
    const tasks = this.kanban().backlog?.tasks ?? [];
    const latestTask = maxBy(Object.values(tasks), 'rank');
    const getNextRank = rankGenerator(latestTask?.rank ?? null);

    return { id: maxId + 1, description, rank: getNextRank() };
  }
}
