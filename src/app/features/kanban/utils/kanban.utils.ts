import {
  Column,
  Columns,
  Kanban,
  KanbanPath,
  KeyboardAction,
  KeyboardActions,
  Task,
  Tasks,
} from '@kanban/models/kanban.models';
import { KeyCode } from '@shared/models/key-codes.enum';
import { forEach, isEmpty, max, omit } from 'lodash-es';

export const updateShallowDeep = <R = Kanban | Column | Tasks | Task>(
  obj: Kanban | Column | Tasks | Task,
  path: KanbanPath,
  value?: any,
): R => {
  if (path.length === 0) return value;

  const nestedObj = obj as any;
  const [head, ...nestPath] = path;
  const current = nestedObj[head];

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

      if (subtask.subtasks) {
        const nest = calculateProgress(subtask.subtasks);
        done += nest.done;
        count += nest.count;
      }
    }
  }

  const progress = count ? Math.round((done / count) * 100) : 0;

  return { done, count, progress };
};

export const updateTaskProgress = (kanban: Kanban, column: Columns, taskId: number): Kanban => {
  const subtasks = kanban[column]?.tasks[taskId]?.subtasks;

  if (!subtasks) {
    return kanban;
  }

  const { progress } = calculateProgress(subtasks);
  const progressPath = [column, 'tasks', taskId.toString(), 'progress'];
  return updateShallowDeep<Kanban>(kanban, progressPath, progress);
};

export const getMaxTaskId = (kanban: Kanban): number => {
  let maxId = 1;

  forEach(kanban, (column) => {
    forEach(column?.tasks, (task) => {
      maxId = max([task?.id ?? 0, maxId]);
    });
  });

  return maxId;
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
