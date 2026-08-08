import {
  Task,
  Tasks,
  Kanban,
  Columns,
  ColumnEnums,
  KeyboardAction,
  KeyboardActions,
  KanbanPath,
} from '@kanban/models/kanban.models';

import { KeyCode } from '@shared/models/key-codes.enum';
import { forEach, isEmpty, omit, without } from 'lodash-es';

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

// updateDeep<R = Kanban | Column | Tasks | Task>(
//   obj: Kanban | Column | Tasks | Task,
//   path: KanbanPath,
//   value: any,
//   remove = false
// ): R {
//   if (path.length === 0) return value;

//   const nestedObj = obj as any;
//   const [head, ...rest] = path;
//   const current = nestedObj?.[head];

//   return {
//     ...nestedObj,
//     [head]: rest.length > 0 ? this.updateDeep(current, rest, value) : value,
//   };
// }

// private removeDeep<T>(obj: any, path: string[]): T {
//   if (!path.length) return obj;
//   const [head, ...tail] = path;
//   if (tail.length === 0) {
//     const copy = Array.isArray(obj) ? [...obj] : { ...obj };
//     delete copy[head];
//     return copy;
//   }
//   return {
//     ...obj,
//     [head]: this.removeDeep(obj[head], tail),
//   };
// }

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

const moveItem = (arr: any, fromIndex: any, toIndex: any) => {
  const item = arr[fromIndex];
  return arr.toSpliced(fromIndex, 1).toSpliced(toIndex, 0, item);
};

export const getKeyAction = ({ code, ctrlKey, shiftKey }: KeyboardEvent): KeyboardActions => {
  if (code === KeyCode.ArrowRight) {
    return KeyboardAction.moveNext;
  }

  if (code === KeyCode.ArrowLeft) {
    return KeyboardAction.moveBack;
  }

  if (ctrlKey && shiftKey && code === KeyCode.KeyZ) {
    return KeyboardAction.redo;
  }

  if (ctrlKey && code === KeyCode.KeyZ) {
    return KeyboardAction.undo;
  }

  if (code === KeyCode.Delete) {
    return KeyboardAction.delete;
  }

  return KeyboardAction._none;
};
