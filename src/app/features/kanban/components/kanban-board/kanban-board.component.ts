import {
  inject,
  signal,
  DOCUMENT,
  computed,
  Component,
  DestroyRef,
  ApplicationRef,
  afterNextRender,
  ChangeDetectionStrategy,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

import { KanbanTask } from '@kanban/models/kanban-task.model';
import { TranslatePipe } from '@ngx-translate/core';
import { KanbanColumnNames } from '@kanban/models/kanban-column.enum';
import { KanbanStoreService } from '@kanban/services/kanban.service';
import { KanbanTaskComponent } from '@kanban/components/kanban-task/kanban-task.component';
import { KanbanColumn, KanbanColumnTasksMap } from '@kanban/models/kanban-column.models';
import { ClickService } from '@services/click.service';
import { isNil } from 'lodash-es';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'kanban-board',
  templateUrl: './kanban-board.component.html',
  imports: [FormsModule, DragDropModule, KanbanTaskComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanComponent {
  private readonly appRef = inject(ApplicationRef);
  private readonly service = inject(KanbanStoreService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clickService = inject(ClickService);

  public readonly columns = computed<Array<KanbanColumn>>(() => this.service.columns());
  public readonly columnsMap = computed<Partial<KanbanColumnTasksMap>>(() => {
    return Object.groupBy(this.service.tasks(), (task: KanbanTask) => task.column);
  });

  public newTaskName: string | null = null;
  public focusedTask = signal<KanbanTask | null>(null);

  constructor() {
    afterNextRender(() => {
      this.clickService.keyEvent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
        const task = this.focusedTask();

        if (!isNil(task)) {
          if (e.key === 'ArrowRight') {
            this.moveNext(task);
          }

          if (e.key === 'ArrowLeft') {
            this.moveBack(task);
          }
        }
      });
    });
  }

  public addTask(): void {
    if (this.newTaskName) {
      this.service.addTask(this.newTaskName);
      this.newTaskName = null;
    }
  }

  public onFocusChange(task: KanbanTask, isFocused: boolean): void {
    this.focusedTask.set(isFocused ? task : null);
  }

  public drop(event: CdkDragDrop<KanbanTask[]>, column: KanbanColumnNames): void {
    const movedTask = event.previousContainer.data[event.previousIndex];

    if (movedTask) {
      const nextTask = event.container.data[event.currentIndex];
      console.log(event.container.data);
      this.service.moveTask(movedTask, column, nextTask?.id);
    }
  }

  public moveBack(task: KanbanTask): void {
    if ('startViewTransition' in this.document) {
      this.document.startViewTransition(() => {
        this.service.moveBack(task) && this.appRef.tick();
      });
    }
  }

  public moveNext(task: KanbanTask): void {
    if ('startViewTransition' in this.document) {
      this.document.startViewTransition(() => {
        this.service.moveNext(task) && this.appRef.tick();
      });
    }
  }

  public remove(task: KanbanTask): void {
    this.service.removeTask(task.id);
  }
}
