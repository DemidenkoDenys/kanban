import { inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { Task } from '@kanban/models/kanban-task.model';
import { Kanban } from '@kanban/models/kanban.models';
import { TaskDto } from '@kanban/dto/task.dto';
import { Direction } from '@shared/models/direction.model';
import { HttpService } from '@shared/services/http.service';
import { ColumnEnums } from '@kanban/models/kanban-column.model';
import { KanbanMapper } from '@kanban/mapper/kanban.mapper';
import { WithUndoRedo } from '../decorators/kanban-undo.decorator';
import { getTaskColumn } from '@kanban/utils/kanban.utils';
import { KanbanUndoService } from '@kanban/services/kanbar-undo.service';
import { columnsApi, tasksApi } from '@kanban/data/kanban.api';

@Injectable()
export class KanbanStoreService {
  public kanban = signal<Kanban>(new Kanban());
  public service = inject(HttpService);
  public undoService = inject(KanbanUndoService);
  public isUndoPossible = this.undoService.isUndoPossible;
  public isRedoPossible = this.undoService.isRedoPossible;

  public columnsApi = rxResource<Array<ColumnEnums>, Array<ColumnEnums>>({
    stream: () => this.service.get(columnsApi),
  });

  public kanbanApi = rxResource<Kanban, Array<ColumnEnums>>({
    params: () => this.columnsApi.value() ?? [],
    stream: ({ params }) => this.service.get(tasksApi).pipe(map((t) => this.init(params, t))),
    defaultValue: new Kanban(),
  });

  public init(columns: Array<ColumnEnums>, tasks: Array<TaskDto>): Kanban {
    const kanban = KanbanMapper.toViewModel(columns, tasks);
    this.kanban.set(kanban);
    return kanban;
  }

  @WithUndoRedo()
  public addTask(description: string): void {
    this.kanban.update((kanban) => kanban.addNewTask(description));
  }

  @WithUndoRedo()
  public moveTask(task: Task, from: ColumnEnums, to: ColumnEnums | null, index?: number): void {
    if (task && from && to) {
      this.kanban.update((kanban) => kanban.moveTask(from, to, task, index));
    }
  }

  @WithUndoRedo()
  public updateTask(uid: string, data: Partial<Task>): void {
    const column = getTaskColumn(this.kanban(), uid) ?? null;
    if (column) {
      this.kanban.update((kanban) => kanban.updateTask(column, uid, data));
    }
  }

  @WithUndoRedo()
  public updateSubtask(column: ColumnEnums, tasksChain: Array<Task>): void {
    this.kanban.update((kanban) => kanban.updateSubtask(column, tasksChain));
  }

  @WithUndoRedo()
  public removeTask(task: Task | null): void {
    const column = getTaskColumn(this.kanban(), task?.uid) ?? null;
    if (column && task?.uid) {
      this.kanban.update((kanban) => kanban.removeTask(column, task, true));
    }
  }

  public moveNext(task: Task | null): void {
    const column = getTaskColumn(this.kanban(), task?.uid) ?? null;
    if (column && task) {
      const columns = this.kanban().columnsOrder;
      const nextIndex = columns.indexOf(column) + 1;
      const nextColumn = nextIndex ? columns[nextIndex] : null;
      this.moveTask(task, column, nextColumn);
    }
  }

  public moveBack(task: Task | null): void {
    const column = getTaskColumn(this.kanban(), task?.uid) ?? null;
    if (column && task) {
      const columns = this.kanban().columnsOrder;
      const index = columns.indexOf(column);
      const indexPrev = index > 0 ? index - 1 : null;
      const columnPrev = indexPrev !== null ? columns[indexPrev] : null;
      this.moveTask(task, column, columnPrev);
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

  public getNeighborTaskId = (task: Task | null, direction: Direction): string | null => {
    const neighbours = this.kanban().neighbours;
    return task ? (neighbours ? neighbours[task.uid][direction] : null) : null;
  };
}
