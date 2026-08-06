import { Injectable, signal, WritableSignal } from '@angular/core';
import { KanbanTask } from '../models/kanban-task.model';
import { KanbanColumn } from '../models/kanban-column.models';
import { KanbanColumnName, KanbanColumnNames } from '../models/kanban-column.enum';
import { maxBy, reject } from 'lodash-es';
import { columns } from '@kanban/data/columns';
import { tasks } from '@kanban/data/tasks';

@Injectable()
export class KanbanStoreService {
  public columns = signal<Array<KanbanColumn>>(columns);
  public tasks = signal<KanbanTask[]>(tasks);

  /**
   * Adds a new task to the store with the specified description.
   * Assigned to the 'done' column by default with an auto-incremented ID.
   * @param description The text description of the new task.
   */
  public addTask(description: string): void {
    const maxId = maxBy(this.tasks(), 'id')?.id ?? 0;
    const task: KanbanTask = {
      id: maxId + 1,
      column: KanbanColumnName.done,
      description,
    };
    this.tasks.update((tasks) => [...tasks, task]);
  }

  /**
   * Moves a task one column backward in the workflow sequence.
   * @param task The Kanban task to move.
   * @returns The updated task if moved successfully, otherwise null.
   */
  public moveBack(task: KanbanTask): KanbanTask | null {
    const columns = this.columns();
    const index = columns.findIndex((column) => column.name === task.column);
    if (index > 0) {
      this.moveTask(task, columns[index - 1].name);
      return task;
    }
    return null;
  }

  /**
   * Moves a task one column forward in the workflow sequence.
   * @param task The Kanban task to move.
   * @returns The updated task if moved successfully, otherwise null.
   */
  public moveNext(task: KanbanTask): KanbanTask | null {
    const columns = this.columns();
    const index = columns.findIndex((column) => column.name === task.column);
    if (index < columns.length - 1) {
      this.moveTask(task, columns[index + 1].name);
      return task;
    }
    return null;
  }

  /**
   * Moves a task to a target column, optionally placing it at a specific position.
   * @param task The Kanban task to move.
   * @param column The destination column name.
   * @param position Optional target index or order inside the column.
   */
  public moveTask(task: KanbanTask, column: KanbanColumnNames, nextTaskId?: number): void {
    const tasks = this.tasks();
    const newTasks = reject(tasks, { id: task.id });
    const newTask = { ...task, column };

    if (nextTaskId) {
      const nextIndex = newTasks.findIndex((task) => task.id === nextTaskId);
      newTasks.splice(nextIndex, 0, newTask);
    } else {
      newTasks.push(newTask);
    }
    this.tasks.update(() => newTasks);
  }

  /**
   * Removes a task from the store by its unique identifier.
   * @param id The ID of the task to remove.
   */
  public removeTask(id: number): void {
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }
}
