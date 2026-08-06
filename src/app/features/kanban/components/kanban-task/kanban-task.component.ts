import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { KanbanTask } from '@kanban/models/kanban-task.model';

@Component({
  selector: 'li[kanban-task]',
  templateUrl: './kanban-task.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanTaskComponent {
  public readonly inputItem = input.required<KanbanTask>();
  public readonly focusChange = output<boolean>();
}
