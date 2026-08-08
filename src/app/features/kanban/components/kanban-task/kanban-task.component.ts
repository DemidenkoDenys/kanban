import {
  input,
  output,
  viewChild,
  Component,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';

import { ColumnEnums, Task } from '@kanban/models/kanban.models';
import { MatMenuModule } from '@angular/material/menu';
import { KanbanSubtasks } from '../kanban-subtasks/kanban-subtasks';

@Component({
  selector: 'li[kanban-task]',
  templateUrl: './kanban-task.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KanbanSubtasks, MatMenuModule],
})
export class KanbanTaskComponent {
  public readonly column = input.required<ColumnEnums>();
  public readonly disabled = input<boolean>();
  public readonly taskInput = input.required<Task>();
  public readonly menuOpened = output<{ event: MouseEvent; task: Task; column: ColumnEnums }>();
  public readonly focusChange = output<boolean>();
  public readonly subtaskChange = output<Array<Task>>();

  private readonly article = viewChild<ElementRef>('article');

  onClick(): void {
    this.article()?.nativeElement?.focus();
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuOpened.emit({ task: this.taskInput(), column: this.column(), event });
  }
}
