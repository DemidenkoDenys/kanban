import { Map } from 'immutable';
import { Task } from '@kanban/models/kanban-task.model';
import { Kanban } from '@kanban/models/kanban.models';
import { TaskDto } from '@kanban/dto/task.dto';
import { calculateProgress } from '@kanban/utils/kanban.utils';
import { Column, ColumnEnums } from '@kanban/models/kanban-column.model';

export class KanbanMapper {
  static toViewModel(columnsOrder: Array<ColumnEnums> = [], tasksApi?: Array<TaskDto>): Kanban {
    const kanban = new Kanban();
    const tasks: Record<number, Task> = {};
    const subtasks: Record<number, Array<Task>> = {};
    const rootTasks: Array<Task> = [];
    const taskColumns: Record<number, ColumnEnums> = {};

    let columns = Map<ColumnEnums, Column>();

    columnsOrder.forEach((column, i) => {
      columns = columns.set(column, new Column(i, column));
    });

    if (!tasksApi?.length) {
      return kanban;
    }

    for (const taskApi of tasksApi) {
      const { id, taskId: parentId, column } = taskApi;
      const task = new Task({ description: taskApi.description, done: taskApi.done }, taskApi.id);

      // aggregate all tasks in map
      tasks[id] = task;

      // aggregate root tasks in map
      if (taskApi.column) {
        rootTasks.push(task);
        taskColumns[id] = taskApi.column;
      }

      // add root task
      if (column && !parentId) {
        columns = columns.update(column, (col?: Column) => col?.addTask(task));
        continue;
      }

      // add sub-task
      if (parentId) {
        subtasks[parentId] = [...(subtasks?.[parentId] ?? []), task];
      }

      // add sub-task to parent task
      if (taskApi.taskId) {
        const parentTask = columns.get(taskColumns[taskApi.taskId])?.getTask(taskApi.taskId);
        if (parentTask) {
          const { tasks = {}, tasksOrder = [] } = parentTask;
          parentTask.tasks = { ...tasks, [task.uid]: task };
          parentTask.tasksOrder = [...tasksOrder, task.uid];
        }
      }

      // add missing subtasks (subtask that stored before parent task)
      subtasks[id]?.forEach((subtask) => {
        if (!task.tasksOrder?.includes(subtask.uid)) {
          const { tasks = {}, tasksOrder = [] } = task;
          task.tasks = { ...tasks, [subtask.uid]: subtask };
          task.tasksOrder = [...tasksOrder, subtask.uid];
        }
      });
    }

    // calculate root tasks progress
    rootTasks.forEach((task) => {
      task.progress = calculateProgress(task.tasks).progress;
    });

    return kanban.init(columns, columnsOrder);
  }
}
