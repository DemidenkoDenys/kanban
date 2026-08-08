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
import { CommonModule, KeyValue, NgTemplateOutlet } from '@angular/common';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { ColumnEnums, KeyboardActions, Task } from '@kanban/models/kanban.models';
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
  public contextMenu = viewChild<ContextMenuComponent>('contextMenu');
  public newTaskName: string | null = null;
  public focusedTask = signal<{ task: Task; column: ColumnEnums } | null>(null);
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

  public onFocusChange(column: ColumnEnums, task: Task, focused: boolean): void {
    this.focusedTask.set(focused ? { task, column } : null);
  }

  contextMenuTask = signal<{ task: Task; column: ColumnEnums } | null>(null);
  public onMenuOpened({
    task,
    event,
    column,
  }: {
    task: Task;
    event: MouseEvent;
    column: ColumnEnums;
  }): void {
    this.contextMenuTask.set(task ? { task, column } : null);
    this.contextMenu()?.open(event);
  }

  closeMenu(): void {
    this.contextMenu()?.close();
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  public drop(event: CdkDragDrop<any>): void {
    const { container: curr, previousContainer: prev, item, currentIndex: index } = event;
    const task = prev.data[item.data] ?? null;
    const columnTo = curr.element.nativeElement.getAttribute('data-column') as ColumnEnums;
    const columnFrom = prev.element.nativeElement.getAttribute('data-column') as ColumnEnums;
    this.service.moveTask(task, columnFrom, columnTo, index);
  }

  public moveNext(column: ColumnEnums | null, task: Task | null): void {
    if ('startViewTransition' in this.document) {
      this.document.startViewTransition(() => {
        this.service.moveNext(column, task);
      });
    }
  }

  public moveBack(column: ColumnEnums | null, task: Task | null): void {
    if ('startViewTransition' in this.document) {
      this.document.startViewTransition(() => {
        this.service.moveBack(column, task);
      });
    }
  }

  private moveFocusedNext(): void {
    const { task = null, column = null } = this.focusedTask() ?? {};
    this.moveNext(column, task);
  }

  private moveFocusedBack(): void {
    const { task = null, column = null } = this.focusedTask() ?? {};
    this.moveBack(column, task);
  }

  private deleteFocusedTask(): void {
    const { task = null, column = null } = this.focusedTask() ?? {};
    this.remove(column, task?.id ?? null);
  }

  public remove(column: ColumnEnums | null, taskId: string | null): void {
    this.service.removeTask(column, taskId);
  }

  public onSubtaskChange(column: ColumnEnums, subtaskChain: Array<Task>): void {
    this.service.updateSubtask(column, subtaskChain);
  }
}
