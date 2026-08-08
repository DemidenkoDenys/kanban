import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { getKeyAction } from '@kanban/utils/kanban.utils';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { ColumnEnums, Direction, KeyboardActions, Task } from '@kanban/models/kanban.models';
import { ContextMenuComponent } from '@shared/components/context-menu/context-menu.component';

@Component({
  selector: 'kanban-board',
  templateUrl: './kanban-board.component.html',
  imports: [
    FormsModule,
    CommonModule,
    TranslatePipe,
    DragDropModule,
    KanbanTaskComponent,
    ContextMenuComponent,
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
  public newTaskName: string | null = null;
  public focusTaskId = signal<string | null>(null);
  public focusedTask = signal<Task | null>(null);
  public contextMenu = viewChild<ContextMenuComponent>('contextMenu');
  public contextMenuTask = signal<{ task: Task; column: ColumnEnums } | null>(null);

  public readonly isUndoPossible = computed(() => this.service.isUndoPossible());
  public readonly isRedoPossible = computed(() => this.service.isRedoPossible());

  public readonly actions: Record<KeyboardActions, () => void> = {
    focusUp: () => this.focusNextTask('up'),
    focusDown: () => this.focusNextTask('down'),
    focusLeft: () => this.focusNextTask('left'),
    focusRight: () => this.focusNextTask('right'),
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
        const action = getKeyAction(e);
        if (action) {
          this.actions[action]();
          this.closeMenu();
        }
      });
    });

    // effect(() => console.log(this.service.kanban()));
  }

  public addTask(): void {
    if (this.newTaskName) {
      this.service.addTask(this.newTaskName);
      this.newTaskName = null;
    }
  }

  public onFocusChange(task: Task, focused: boolean): void {
    this.focusedTask.set(focused ? task : null);
  }

  public onMenuOpened(e: { task: Task; event: MouseEvent; column: ColumnEnums }): void {
    this.contextMenuTask.set(e.task ? { task: e.task, column: e.column } : null);
    this.contextMenu()?.open(e.event);
  }

  public closeMenu(): void {
    this.contextMenu()?.close();
  }

  public onContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  public drop(event: CdkDragDrop<any>): void {
    const { container: curr, previousContainer: prev, item, currentIndex: index } = event;
    const task = prev.data[item.data] ?? null;
    const columnTo = curr.element.nativeElement.getAttribute('data-column') as ColumnEnums;
    const columnFrom = prev.element.nativeElement.getAttribute('data-column') as ColumnEnums;
    this.service.moveTask(task, columnFrom, columnTo, index);
  }

  public moveNext(task: Task | null): void {
    if ('startViewTransition' in this.document) {
      this.document.startViewTransition(() => {
        this.service.moveNext(task);
        this.appRef.tick();
      });
    }
  }

  public moveBack(task: Task | null): void {
    if ('startViewTransition' in this.document) {
      this.document.startViewTransition(() => {
        this.service.moveBack(task);
        this.appRef.tick();
      });
    }
  }

  private moveFocusedNext(): void {
    this.moveNext(this.focusedTask());
  }

  private moveFocusedBack(): void {
    this.moveBack(this.focusedTask());
  }

  private deleteFocusedTask(): void {
    this.remove(this.focusedTask()?.id ?? null);
  }

  public remove(taskId: string | null): void {
    this.service.removeTask(taskId);
  }

  private focusNextTask(direction: Direction): void {
    const taskId = this.service.getNeighborTaskId(this.focusedTask(), direction);
    if (taskId) {
      this.focusTaskId.set(taskId);
    }
  }

  public onSubtaskChange(column: ColumnEnums, subtaskChain: Array<Task>): void {
    this.service.updateSubtask(column, subtaskChain);
  }
}
