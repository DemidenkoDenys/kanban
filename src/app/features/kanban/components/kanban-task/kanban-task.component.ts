import {
  input,
  output,
  viewChild,
  Component,
  ElementRef,
  ChangeDetectionStrategy,
  effect,
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
  public readonly focus = input<boolean>();
  public readonly column = input.required<ColumnEnums>();
  public readonly disabled = input<boolean>();
  public readonly taskInput = input.required<Task>();
  public readonly menuOpened = output<{ event: MouseEvent; task: Task; column: ColumnEnums }>();
  public readonly focusChange = output<boolean>();
  public readonly subtaskChange = output<Array<Task>>();

  private readonly article = viewChild<ElementRef>('article');

  constructor() {
    effect(() => {
      const article = this.article();
      if (article?.nativeElement) {
        if (this.focus()) {
          article.nativeElement.focus();
        } else {
          article.nativeElement.blur();
        }
      }
    });
  }

  onClick(): void {
    this.article()?.nativeElement?.focus();
  }

  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuOpened.emit({ task: this.taskInput(), column: this.column(), event });
  }
}
