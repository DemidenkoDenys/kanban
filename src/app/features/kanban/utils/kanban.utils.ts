import { Task, TaskChild, TaskList, Tasks } from '@kanban/models/kanban-task.model';
import { ColumnEnums, Columns, KanbanPath } from '@kanban/models/kanban-column.model';
import { Neighbour, Neighbours } from '@kanban/models/kanban-neighboars.model';
import { isEmpty, min, omit, set, without } from 'lodash-es';
import { KeyboardAction, KeyboardActions } from '@kanban/models/kanban-actions.enum';
import { Z, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, DELETE } from '@angular/cdk/keycodes';
import { KanbanState } from '@kanban/store/kanban.state';

export const updateShallowDeep = <R = KanbanState | Columns | Tasks | Task>(
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

export const calculateProgress = (
  subtasks?: Tasks,
): { done: number; count: number; progress: number } => {
  if (!subtasks || isEmpty(subtasks)) {
    return { done: 0, count: 0, progress: 100 };
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

export const getTaskColumn = (columns: Columns, taskId?: string | null): ColumnEnums | null => {
  if (!taskId || !columns) return null;

  for (const column in columns) {
    if (columns[column]?.tasksOrder?.includes(taskId)) {
      return column as ColumnEnums;
    }
  }

  return null;
};

export const getKeyAction = ({ keyCode, ctrlKey, shiftKey }: KeyboardEvent): KeyboardActions => {
  const { _none, redo, undo, moveBack, moveNext, delete: remove } = KeyboardAction;
  const { focusUp, focusDown, focusLeft, focusRight } = KeyboardAction;

  switch (keyCode) {
    case Z: {
      return ctrlKey ? (shiftKey ? redo : undo) : _none;
    }

    case RIGHT_ARROW:
      return ctrlKey ? moveNext : focusRight;

    case LEFT_ARROW:
      return ctrlKey ? moveBack : focusLeft;

    case UP_ARROW:
      return focusUp;

    case DOWN_ARROW:
      return focusDown;

    case DELETE:
      return remove;

    default:
      return _none;
  }
};

export const getNeighbours = (kanban: KanbanState): Neighbours => {
  const { columns, columnsOrder } = kanban;
  const neighbours: Neighbours = {};

  columnsOrder.forEach((columnKey, ci) => {
    const prevTasks = columns[columnsOrder[ci - 1]]?.tasksOrder ?? [];
    const nextTasks = columns[columnsOrder[ci + 1]]?.tasksOrder ?? [];
    const isLastCol = ci === columnsOrder.length - 1;
    const column = columns[columnKey];

    if (column) {
      const tasksOrder = column.tasksOrder ?? [];

      tasksOrder.forEach((taskId, ti) => {
        const neighbour = new Neighbour();
        const isLastTask = ti === tasksOrder.length - 1;
        const lastNextIndex = nextTasks.length - 1;

        neighbour.up = ti ? tasksOrder[ti - 1] : ci ? (prevTasks?.at(-1) ?? null) : null;
        neighbour.down = isLastTask ? (isLastCol ? null : nextTasks[0]) : tasksOrder[ti + 1];
        neighbour.left = ci ? (prevTasks[min([ti, prevTasks.length - 1])] ?? null) : null;
        neighbour.right = isLastCol ? null : (nextTasks[min([ti, lastNextIndex])] ?? null);

        neighbours[taskId] = neighbour;
      });
    }
  });

  return neighbours;
};

export const addTask = <T extends TaskChild>(source: T, task: Task, index?: number): T => {
  if (!source) return source;
  const { tasks = {}, tasksOrder = [] } = source;
  source.tasks = { ...tasks, [task.uid]: task };
  source.tasksOrder = tasksOrder.toSpliced(index ?? tasksOrder.length, 0, task.uid);
  return source;
};

export const updateTask = <T extends TaskChild>(source: T, uid: string, data: Partial<Task>): T => {
  if (!source || !source.tasks || !source.tasks[uid]) return source;
  source.tasks = set(source.tasks, [uid], data);
  return source;
};

export const removeTask = <T extends TaskChild>(source: T, task: Task) => {
  source.tasks = omit(source.tasks, task.uid);
  source.tasksOrder = without(source.tasksOrder, task.uid);
  return source;
};

export const updateSubtask = <T extends TaskChild>(source: T, chain: TaskList): T => {
  if (!chain.at(-1)) return source;
  const path = chain.map((t) => ['tasks', t.uid]).flat();
  const task = chain[0];
  const column = updateShallowDeep(source, path, chain.at(-1));
  const progress = calculateProgress(column.tasks?.[task.uid].tasks).progress;
  return updateShallowDeep(column, ['tasks', task.uid], { ...task, progress });
};

// immutable.js version
// export const getNeighboursImm = (kanban: Kanban): Neighbours => {
//   const { columns, columnsOrder } = kanban;
//   const neighbours: Neighbours = {};

//   columnsOrder.forEach((columnKey, ci) => {
//     const prevTasks = columns.get(columnsOrder[ci - 1])?.tasksOrder ?? new Map();
//     const nextTasks = columns.get(columnsOrder[ci + 1])?.tasksOrder ?? new Map();
//     const isLastCol = ci === columnsOrder.length - 1;
//     const column = columns.get(columnKey);

//     if (column) {
//       const tasksOrder = column.tasksOrder ?? new Map();

//       tasksOrder.forEach((taskId, ti) => {
//         const neighbour = new Neighbour();
//         const isLastTask = ti === tasksOrder.size - 1;
//         const lastNextIndex = nextTasks.size - 1;

//         neighbour.up = ti ? tasksOrder.get(ti - 1) : ci ? (prevTasks?.get(-1) ?? null) : null;
//         neighbour.down = isLastTask ? isLastCol ? null : nextTasks.get(0) : tasksOrder.get(ti + 1);
//         neighbour.left = ci ? (prevTasks.get(min([ti, prevTasks.size - 1])) ?? null) : null;
//         neighbour.right = isLastCol ? null : (nextTasks.get(min([ti, lastNextIndex])) ?? null);

//         neighbours[taskId] = neighbour;
//       });
//     }
//   });

//   return neighbours;
// };
