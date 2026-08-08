import {
  Task,
  Tasks,
  Kanban,
  Columns,
  Neighbour,
  Neighbours,
  KanbanPath,
  ColumnEnums,
  KeyboardAction,
  KeyboardActions,
} from '@kanban/models/kanban.models';

import { KeyCode } from '@shared/models/key-codes.enum';
import { forEach, isEmpty, min, omit, without } from 'lodash-es';

export const updateShallowDeep = <R = Kanban | Columns | Tasks | Task>(
  obj: R,
  path: KanbanPath,
  value?: any,
): R => {
  if (path.length === 0) return value;

  const nestedObj = obj as any;
  const [head, ...nestPath] = path;
  const current = nestedObj?.[head];

  if (!nestPath.length) {
    if (value === undefined) {
      return omit(nestedObj, head) as R;
    }
    return { ...nestedObj, [head]: value };
  }

  return {
    ...nestedObj,
    [head]: updateShallowDeep(current, nestPath, value),
  };
};

export const toAddedTaskId = (
  kanban: Kanban,
  column: ColumnEnums,
  taskId: string,
  index?: number,
): Kanban => {
  const order = kanban.columns[column]?.tasksOrder ?? [];
  const path: KanbanPath = ['columns', column, 'tasksOrder'];
  const value = order.toSpliced(index ?? order.length, 0, taskId);
  return updateShallowDeep<Kanban>(kanban, path, value);
};

export const toAddedTask = (
  kanban: Kanban,
  column: ColumnEnums,
  task: Task,
  index?: number,
): Kanban => {
  const kanbak2 = toAddedTaskId(kanban, column, task.id, index);
  const path = ['columns', column, 'tasks', task.id];
  return updateShallowDeep<Kanban>(kanbak2, path, task);
};

export const toRemovedTask = (
  kanban: Kanban,
  column: ColumnEnums | null,
  taskId: string,
): Kanban => {
  if (!column) return kanban;

  const path2 = ['columns', column, 'tasks', taskId];
  const kanban2 = updateShallowDeep<Kanban>(kanban, path2);

  const path3 = ['columns', column, 'tasksOrder'];
  const order3 = without(kanban.columns[column]?.tasksOrder, taskId);
  const kanban3 = updateShallowDeep<Kanban>(kanban2, path3, order3);

  return kanban3;
};

export const toMovedTask = (
  kanban: Kanban,
  task: Task,
  from: ColumnEnums,
  to: ColumnEnums,
  index?: number,
): Kanban => {
  const kanban2 = toRemovedTask(kanban, from, task.id);
  const kanban3 = toAddedTask(kanban2, to, task, index);
  return kanban3;
};

export const toUpdatedSubtask = (
  kanban: Kanban,
  column: ColumnEnums,
  chain: Array<Task>,
  path = ['columns', column],
): Kanban => {
  forEach(chain, (task) => path.push('tasks', task.id));
  return updateShallowDeep(kanban, path, chain.at(-1));
};

export const calculateProgress = (
  subtasks?: Tasks,
): { done: number; count: number; progress: number } => {
  if (!subtasks || isEmpty(subtasks)) {
    return { done: 0, count: 0, progress: 0 };
  }

  let done = 0;
  let count = 0;

  for (const subtaskId in subtasks) {
    const subtask = subtasks[subtaskId];

    if (subtask) {
      count++;

      if (subtask.done) {
        done++;
      }

      if (subtask.tasks) {
        const nest = calculateProgress(subtask.tasks);
        done += nest.done;
        count += nest.count;
      }
    }
  }

  const progress = count ? Math.round((done / count) * 100) : 0;

  return { done, count, progress };
};

export const toCalculatedProgress = (
  kanban: Kanban,
  column: ColumnEnums,
  taskId: string,
): Kanban => {
  const { tasks: subtasks, tasksOrder } = kanban.columns[column]?.tasks?.[taskId] ?? {};

  if (!tasksOrder?.length) {
    return kanban;
  }

  const { progress } = calculateProgress(subtasks);
  const progressPath = ['columns', column, 'tasks', taskId, 'progress'];
  return updateShallowDeep<Kanban>(kanban, progressPath, progress);
};

export const getTaskColumn = (kanban: Kanban, taskId?: string | null): ColumnEnums | null => {
  if (!taskId || !kanban.columns) return null;

  for (const column of kanban.columnsOrder) {
    const columnName = column as ColumnEnums;
    if (kanban.columns[columnName]?.tasksOrder?.includes(taskId)) {
      return columnName;
    }
  }

  return null;
};

export const moveItem = <T = Task>(array: Array<T>, from: number, to: number): Array<T> => {
  return array.toSpliced(from, 1).toSpliced(to, 0, array[from]);
};

export const getKeyAction = ({ code, ctrlKey, shiftKey }: KeyboardEvent): KeyboardActions => {
  const { _none, redo, undo, moveBack, moveNext, delete: remove } = KeyboardAction;
  const { focusUp, focusDown, focusLeft, focusRight } = KeyboardAction;

  switch (code) {
    case KeyCode.KeyZ: {
      return ctrlKey ? (shiftKey ? redo : undo) : _none;
    }

    case KeyCode.ArrowRight:
      return ctrlKey ? moveNext : focusRight;

    case KeyCode.ArrowLeft:
      return ctrlKey ? moveBack : focusLeft;

    case KeyCode.ArrowUp:
      return focusUp;

    case KeyCode.ArrowDown:
      return focusDown;

    case KeyCode.Delete:
      return remove;

    default:
      return _none;
  }
};

export const getNeighbours = (kanban: Kanban): Neighbours => {
  const { columns, columnsOrder } = kanban;
  const neighbours: Neighbours = {};

  columnsOrder.forEach((column, ci) => {
    const prevTasks = columns[columnsOrder[ci - 1]]?.tasksOrder ?? [];
    const nextTasks = columns[columnsOrder[ci + 1]]?.tasksOrder ?? [];
    const isLastColumn = ci === columnsOrder.length - 1;

    if (columns[column]) {
      const tasksOrder = columns[column]?.tasksOrder ?? [];

      tasksOrder.forEach((taskId, ti) => {
        const neighbour = new Neighbour();
        const isLastTask = ti === tasksOrder.length - 1;
        const lastNextIndex = nextTasks.length - 1;

        neighbour.up = ti ? tasksOrder[ti - 1] : ci ? (prevTasks?.at(-1) ?? null) : null;
        neighbour.down = isLastTask ? (isLastColumn ? null : nextTasks[0]) : tasksOrder[ti + 1];
        neighbour.left = ci ? (prevTasks[min([ti, prevTasks.length - 1])] ?? null) : null;
        neighbour.right = isLastColumn ? null : (nextTasks[min([ti, lastNextIndex])] ?? null);

        neighbours[taskId] = neighbour;
      });
    }
  });

  return neighbours;
};
