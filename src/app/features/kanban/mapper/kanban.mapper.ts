import { TaskDto } from '@kanban/dto/task.dto';
import { Column, ColumnEnums, Columns, Kanban, Task } from '@kanban/models/kanban.models';
import { calculateProgress } from '@kanban/utils/kanban.utils';
import { cloneDeep } from 'lodash-es';

export class KanbanMapper {
  static toViewModel(columnsOrder: Array<ColumnEnums> = [], tasksApi?: Array<TaskDto>): Kanban {
    const tasks: Record<number, Task> = {};
    const columns: Columns = {};
    const subtasks: Record<number, Array<Task>> = {};
    const rootTasks: Array<Task> = [];

    columnsOrder.forEach((column, i) => {
      columns[column] = new Column(i, column);
    });

    if (!tasksApi?.length) {
      return { columns, columnsOrder };
    }

    for (const taskApi of tasksApi) {
      const apiId = taskApi.id;
      const apiTask = { description: taskApi.description, done: taskApi.done };
      const task = new Task(apiTask, taskApi.id);
      const column = taskApi.column ? columns[taskApi.column] : null;
      const parentTask = taskApi.taskId && tasks[taskApi.taskId];
      const parentApiId = taskApi.taskId;

      // aggregate all tasks in map
      tasks[apiId] = task;

      // aggregate root tasks in map
      if (taskApi.column) {
        rootTasks.push(task);
      }

      // add root task
      if (column && !parentApiId) {
        column.tasks[task.id] = task;
        column.tasksOrder.push(task.id);
        continue;
      }

      // add sub-task
      if (parentApiId) {
        subtasks[parentApiId] = [...(subtasks?.[parentApiId] ?? []), task];
      }

      // add sub-task to parent task
      if (parentTask) {
        const { tasks = {}, tasksOrder = [] } = parentTask;
        parentTask.tasks = { ...tasks, [task.id]: task };
        parentTask.tasksOrder = [...tasksOrder, task.id];
      }

      // add missing subtasks (subtask that stored before parent task)
      subtasks[apiId]?.forEach((subtask) => {
        if (!task.tasksOrder?.includes(subtask.id)) {
          const { tasks = {}, tasksOrder = [] } = task;
          task.tasks = { ...tasks, [subtask.id]: subtask };
          task.tasksOrder = [...tasksOrder, subtask.id];
        }
      });
    }

    // calculate root tasks progress
    rootTasks.forEach((task) => {
      task.progress = calculateProgress(task.tasks).progress;
    });

    return { columns: cloneDeep(columns), columnsOrder };
  }
}
