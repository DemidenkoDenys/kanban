import { Task, Tasks } from '@kanban/models/kanban-task.model';
import { Kanban, KanbanPath } from '@kanban/models/kanban.models';
import { ColumnEnums, Columns } from '@kanban/models/kanban-column.model';
import { Neighbour, Neighbours } from '@kanban/models/kanban-neighboars.model';
import { forEach, isEmpty, min, omit } from 'lodash-es';
import { KeyboardAction, KeyboardActions } from '@kanban/models/kanban-actions.enum';
import { Z, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, DELETE } from '@angular/cdk/keycodes';

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

export const getTaskColumn = (kanban: Kanban, taskId?: string | null): ColumnEnums | null => {
  if (!taskId || !kanban.columns) return null;

  for (const column of kanban.columnsOrder) {
    const columnName = column as ColumnEnums;
    if (kanban.columns.get(columnName)?.tasksOrder?.includes(taskId)) {
      return columnName;
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

export const getNeighbours = (kanban: Kanban): Neighbours => {
  const { columns, columnsOrder } = kanban;
  const neighbours: Neighbours = {};

  columnsOrder.forEach((columnKey, ci) => {
    const prevTasks = columns.get(columnsOrder[ci - 1])?.tasksOrder ?? new Map();
    const nextTasks = columns.get(columnsOrder[ci + 1])?.tasksOrder ?? new Map();
    const isLastCol = ci === columnsOrder.length - 1;
    const column = columns.get(columnKey);

    if (column) {
      const tasksOrder = column.tasksOrder ?? new Map();

      tasksOrder.forEach((taskId, ti) => {
        const neighbour = new Neighbour();
        const isLastTask = ti === tasksOrder.size - 1;
        const lastNextIndex = nextTasks.size - 1;

        neighbour.up = ti ? tasksOrder.get(ti - 1) : ci ? (prevTasks?.get(-1) ?? null) : null;
        neighbour.down = isLastTask ? isLastCol ? null : nextTasks.get(0) : tasksOrder.get(ti + 1);
        neighbour.left = ci ? (prevTasks.get(min([ti, prevTasks.size - 1])) ?? null) : null;
        neighbour.right = isLastCol ? null : (nextTasks.get(min([ti, lastNextIndex])) ?? null);

        neighbours[taskId] = neighbour;
      });
    }
  });

  return neighbours;
};
