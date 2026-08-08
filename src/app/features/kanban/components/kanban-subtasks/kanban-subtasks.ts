import { afterNextRender, Component, input, output } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { KeyValuePipe } from '@angular/common';
import { Task, Tasks } from '@kanban/models/kanban.models';

@Component({
  selector: 'kanban-subtasks',
  templateUrl: './kanban-subtasks.html',
  imports: [KeyValuePipe, MatCheckboxModule],
})
export class KanbanSubtasks {
  public readonly task = input.required<Task>();
  public readonly subtasks = input.required<Tasks>();
  public readonly subtaskChange = output<Array<Task>>();

  onSubTaskChange(task: Task, event: MatCheckboxChange): void {
    const changedTask = { ...task, done: event.checked };
    this.subtaskChange.emit([this.task(), changedTask]);
  }

  onNestedSubTaskChange(event: Array<Task>): void {
    this.subtaskChange.emit([this.task(), ...event]);
  }
}
