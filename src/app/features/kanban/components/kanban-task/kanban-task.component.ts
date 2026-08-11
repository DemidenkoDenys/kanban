import {
  input,
  output,
  viewChild,
  Component,
  ElementRef,
  ChangeDetectionStrategy,
  effect,
  signal,
} from '@angular/core';

import { Task } from '@kanban/models/kanban-task.model';
import { ColumnEnums } from '@kanban/models/kanban-column.model';
import { MatMenuModule } from '@angular/material/menu';
import { KanbanSubtasks } from '../kanban-subtasks/kanban-subtasks';

@Component({
  selector: 'li[kanban-task]',
  templateUrl: './kanban-task.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KanbanSubtasks, MatMenuModule],
})
export class KanbanTaskComponent {
  public readonly focus = input<boolean>();
  public readonly column = input.required<ColumnEnums>();
  public readonly disabled = input<boolean>();
  public readonly taskInput = input.required<Task>();
  public readonly isEditing = signal<boolean>(false);
  public readonly menuOpened = output<{ event: MouseEvent; task: Task; column: ColumnEnums }>();
  public readonly focusChange = output<boolean>();
  public readonly subtaskChange = output<Array<Task>>();
  public readonly animatingTaskUid = input<string | null>();
  public readonly descriptionChange = output<string>();

  private readonly input = viewChild<ElementRef>('input');
  private readonly article = viewChild<ElementRef>('article');

  constructor() {
    effect(() => {
      this.focus() ? this.article()?.nativeElement.focus() : this.article()?.nativeElement.blur();
    });

    effect(() => {
      this.input()?.nativeElement?.focus();
    });
  }

  onClick(): void {
    setTimeout(() => {
      if (this.isEditing()) {
        this.article()?.nativeElement?.blur();
      } else {
        this.article()?.nativeElement?.focus();
      }
    });
  }

  onDoubleClick(event: Event): void {
    event.stopPropagation();
    this.isEditing.set(true);
  }

  onDescriptionChange() {
    const description = (this.input()?.nativeElement as HTMLInputElement)?.value;
    if (description) {
      this.descriptionChange.emit(description);
      this.isEditing.set(false);
    }
  }

  onFocus(inFocus: boolean): void {
    this.focusChange.emit(inFocus);
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuOpened.emit({ task: this.taskInput(), column: this.column(), event });
  }
}
