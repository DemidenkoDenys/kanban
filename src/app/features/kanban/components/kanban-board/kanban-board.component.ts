import {
  inject,
  effect,
  signal,
  DOCUMENT,
  computed,
  Component,
  viewChild,
  DestroyRef,
  ApplicationRef,
  afterNextRender,
  ChangeDetectionStrategy,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TranslatePipe } from '@ngx-translate/core';
import { KanbanStoreService } from '@kanban/services/kanban.service';
import { ClickService } from 'src/app/shared/services/click.service';
import { orderBy } from 'lodash-es';
import { getKeyAction } from '@kanban/utils/kanban.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, KeyValue, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { Columns, KeyboardActions, Task } from '@kanban/models/kanban.models';
import { ContextMenuComponent } from '@shared/components/context-menu/context-menu.component';
import { KeyvaluePrevNextPipe } from '@shared/pipes/keyvalue-prev-next.pipe';

@Component({
  selector: 'kanban-board',
  templateUrl: './kanban-board.component.html',
  imports: [
    FormsModule,
    DragDropModule,
    TranslatePipe,
    KeyValuePipe,
    CommonModule,
    NgTemplateOutlet,
    KanbanTaskComponent,
    ContextMenuComponent,
    KeyvaluePrevNextPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanComponent {
  private readonly appRef = inject(ApplicationRef);
  private readonly service = inject(KanbanStoreService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clickService = inject(ClickService);

  public kanban = computed(() => this.service.kanban());
  public context = signal<{ isOpen: boolean; x: number; y: number } | null>(null);
  public contextMenu = viewChild<ContextMenuComponent>('contextMenu');
  public newTaskName: string | null = null;
  public focusedTask = signal<{
    task: Task;
    prev: Columns;
    curr: Columns;
    next: Columns;
  } | null>(null);
  public readonly isUndoPossible = computed(() => this.service.isUndoPossible());
  public readonly isRedoPossible = computed(() => this.service.isRedoPossible());

  public readonly actions: Record<KeyboardActions, () => void> = {
    moveNext: () => this.moveFocusedNext(),
    moveBack: () => this.moveFocusedBack(),
    delete: () => this.deleteFocusedTask(),
    undo: () => this.service.undoAction(),
    redo: () => this.service.redoAction(),
    _none: () => {},
  };

  constructor() {
    afterNextRender(() => {
      this.clickService.keyEvent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
        this.actions[getKeyAction(e)]();
      });
    });

    effect(() => {
      console.log(this.service.kanban());
    });
  }

  public addTask(): void {
    if (this.newTaskName) {
      this.service.addTask(this.newTaskName);
      this.newTaskName = null;
    }
  }

  public onFocusChange(
    task: Task,
    focused: boolean,
    prev: Columns,
    curr: Columns,
    next: Columns,
  ): void {
    this.focusedTask.set(focused ? { task, prev, curr, next } : null);
  }

  contextMenuTask = signal<Task | null>(null);
  public onMenuOpened({ event, task }: { event: MouseEvent; task: Task }): void {
    this.contextMenuTask.set(task);
    this.contextMenu()?.open(event);
  }

  onContextItemClick(task: Task): void {
    console.log('🚀 ~ onContextItemClick:', task);
    this.contextMenu()?.close();
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  public drop({
    container: curr,
    previousContainer: prev,
    previousIndex: prevIndex,
  }: CdkDragDrop<Task[]>): void {
    const columnTo = curr.element.nativeElement.getAttribute('data-column') as Columns;
    const columnFrom = prev.element.nativeElement.getAttribute('data-column') as Columns;
    const movedTask = orderBy(Object.values(prev.data), 'rank', 'asc')[prevIndex];

    if (movedTask) {
      this.service.moveTo(movedTask, columnTo, columnFrom);
    }
  }

  private moveFocusedNext(): void {
    const task = this.focusedTask();
    if (task) {
      this.moveTo(task.task, task.next, task.curr);
    }
  }

  private moveFocusedBack(): void {
    const task = this.focusedTask();
    if (task) {
      this.moveTo(task.task, task.prev, task.curr);
    }
  }

  public moveTo(task: Task, columnTo: Columns, columnFrom?: Columns): void {
    if (!columnFrom) {
      return;
    }

    if ('startViewTransition' in this.document) {
      this.document.startViewTransition(() => {
        this.service.moveTo(task, columnTo, columnFrom);
        this.appRef.tick();
      });
    }
  }

  private deleteFocusedTask(): void {
    const task = this.focusedTask();
    if (task) {
      this.remove(task.task, task.curr);
    }
  }

  public remove(task: Task, column: Columns): void {
    this.service.removeTask(task.id.toString(), column);
  }

  public sortByRank = <T extends { rank: string } | undefined>(
    a: KeyValue<string, T>,
    b: KeyValue<string, T>,
  ): number => {
    return (a.value && a.value.rank) > (b.value && b.value.rank) ? 1 : -1;
  };

  public onSubtaskChange(column: Columns, subtaskChain: Array<Task>): void {
    this.service.updateSubtask(column, subtaskChain);
  }
}
