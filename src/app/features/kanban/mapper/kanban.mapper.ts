import { TaskDto } from '@kanban/dto/task.dto';
import { getTask, Task } from '@kanban/models/kanban-task.model';
import { addTask, calculateProgress } from '@kanban/utils/kanban.utils';
import { Column, ColumnEnums, Columns, getColumn } from '@kanban/models/kanban-column.model';

export class KanbanMapper {
  static toViewModel(columnsOrder: Array<ColumnEnums> = [], tasksApi?: Array<TaskDto>): Columns {
    const tasks: Record<number, Task> = {};
    const subtasks: Record<number, Array<Task>> = {};
    const rootTasks: Array<Task> = [];
    const taskColumns: Record<number, ColumnEnums> = {};

    let columns: Partial<Record<ColumnEnums, Column>> = {};

    columnsOrder.forEach((column, i) => {
      columns[column] = getColumn(i, column);
    });

    if (!tasksApi?.length) {
      return columns;
    }

    for (const taskApi of tasksApi) {
      const { id, taskId: parentId, column } = taskApi;
      const task = getTask(taskApi.id, { description: taskApi.description, done: taskApi.done });

      // aggregate all tasks in map
      tasks[id] = task;

      // aggregate root tasks in map
      if (taskApi.column) {
        rootTasks.push(task);
        taskColumns[id] = taskApi.column;
      }

      // add root task
      if (column && !parentId) {
        if (columns[column]) {
          addTask<Column>(columns[column], task);
          continue;
        }
      }

      // add sub-task
      if (parentId) {
        subtasks[parentId] = [...(subtasks?.[parentId] ?? []), task];
      }

      // add sub-task to parent task
      if (taskApi.taskId) {
        const columnTasks = columns[taskColumns[taskApi.taskId]]?.tasks;
        const parentTask = columnTasks?.[`task_${taskApi.taskId}`];

        if (parentTask) {
          addTask<Task>(parentTask, task);
        }
      }

      // add missing subtasks (subtask that stored before parent task)
      subtasks[id]?.forEach((subtask) => {
        if (!task.tasksOrder?.includes(subtask.uid)) {
          addTask<Task>(task, subtask);
        }
      });
    }

    // calculate root tasks progress
    rootTasks.forEach((task) => {
      task.progress = calculateProgress(task.tasks).progress;
    });

    return columns;
  }
}
