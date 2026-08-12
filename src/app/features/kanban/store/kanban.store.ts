import { computed, inject } from '@angular/core';

import {
  type,
  withState,
  signalStore,
  withMethods,
  withComputed,
  signalStoreFeature,
} from '@ngrx/signals';

import {
  addTask,
  removeTask,
  updateTask,
  updateSubtask,
  getNeighbours,
} from '@kanban/utils/kanban.utils';

import { getTask, Task } from '@kanban/models/kanban-task.model';
import { withGlitchTracking } from '@angular-architects/ngrx-toolkit';
import { Column, ColumnEnum, ColumnEnums, Columns } from '@kanban/models/kanban-column.model';
import { on, eventGroup, injectDispatch, withEventHandlers, Events } from '@ngrx/signals/events';
import { kanbanState, KanbanState, KanbanStatus } from './kanban.state';
import { withDevtoolsByEnv, withReducersByEnv } from '@shared/store/store.utils';
import { HttpService } from '@shared/services/http.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { columnsApi, tasksApi } from '@kanban/data/kanban.api';
import { KanbanMapper } from '@kanban/mapper/kanban.mapper';
import { TaskDto } from '@kanban/dto/task.dto';
import { set } from 'lodash-es';

export const KANBAN = 'KANBAN';

export function createKanbanEvents(feature: string) {
  return eventGroup({
    source: feature,
    events: {
      load: type<void>(),
      init: type<{ columns: Columns; columnsOrder: Array<ColumnEnums> }>(),
      addNewTask: type<{ description: string }>(),
      insertTask: type<{ column: ColumnEnums; task: Task; index?: number }>(),
      removeTask: type<{ column: ColumnEnums; task: Task; withNeighbours?: boolean }>(),
      moveTask: type<{ from: ColumnEnums; to: ColumnEnums; task: Task; index?: number }>(),
      updateTask: type<{ column: ColumnEnums; uid: string; data: Partial<Task> }>(),
      updateSubtask: type<{ column: ColumnEnums; tasksChain: Array<Task> }>(),
      loadColumns: type<{ columns?: Array<ColumnEnums>; tasks?: Array<TaskDto> }>(),
      setColumns: type<Columns>(),
      setLoading: type<KanbanStatus>(),
      setError: type<{ status: KanbanStatus; error: string } | null>(),
    },
  });
}

export type kanbanEventsGroup = ReturnType<typeof createKanbanEvents>;

export function withKanbanStore(feature: string, events: kanbanEventsGroup) {
  return signalStoreFeature(
    withState<KanbanState>(kanbanState()),

    withDevtoolsByEnv(feature, withGlitchTracking()),

    withComputed((store) => ({
      columns: computed(() => store.columns()),
      columnsOrder: computed(() => store.columnsOrder()),
      neighbours: computed(() => store.neighbours()),
      isError: computed(() => store.error()),
      isTasksLoading: computed(() => store.isLoading() === 'tasks'),
      isColumnsLoading: computed(() => store.isLoading() === 'columns'),
    })),

    withMethods(() => {
      const dispatch = injectDispatch(events);

      return {
        load(): void {
          dispatch.load();
        },
        init(columns: Columns, columnsOrder: Array<ColumnEnums>): void {
          dispatch.init({ columns, columnsOrder });
        },
        setLoading(status: 'columns' | 'tasks'): void {
          dispatch.setLoading(status);
        },
        setError(status: KanbanStatus, error: string): void {
          dispatch.setError(error ? { status, error } : null);
        },
        setColumns(columns: Columns): void {
          dispatch.setColumns(columns);
        },
        loadColumns(columns: Array<ColumnEnums>, tasks: Array<TaskDto>): void {
          dispatch.loadColumns({ columns, tasks });
        },
        addNewTask(description: string): void {
          dispatch.addNewTask({ description });
        },
        insertTask(column: ColumnEnums, task: Task, index?: number): void {
          dispatch.insertTask({ column, task, index });
        },
        updateTask(column: ColumnEnums, uid: string, data: Partial<Task>): void {
          dispatch.updateTask({ column, uid, data });
        },
        moveTask(from: ColumnEnums, to: ColumnEnums, task: Task, index?: number): void {
          dispatch.moveTask({ from, to, task, index });
        },
        removeTask(column: ColumnEnums, task: Task, withNeighbours = false): void {
          dispatch.removeTask({ column, task, withNeighbours });
        },
        updateSubtask(column: ColumnEnums, tasksChain: Array<Task>): void {
          dispatch.updateSubtask({ column, tasksChain });
        },
      };
    }),

    withReducersByEnv(
      on(events.init, ({ payload }) => () => {
        const nextState = kanbanState(payload.columns, payload.columnsOrder);
        return { ...nextState, neighbours: getNeighbours(nextState) };
      }),

      on(events.setLoading, ({ payload }) => (state: KanbanState): KanbanState => {
        return { ...state, isLoading: payload ?? null } as KanbanState;
      }),

      on(events.setColumns, ({ payload }) => (state: KanbanState) => {
        const nextState = { ...state, columns: payload };
        return { ...nextState, neighboars: getNeighbours(nextState) };
      }),

      on(events.loadColumns, ({ payload }) => (state: KanbanState) => {
        const columns = KanbanMapper.toViewModel(payload.columns, payload.tasks);
        const isLoading = payload.columns && !payload.tasks ? 'tasks' : null;
        return { ...state, columns, columnsOrder: payload.columns, isLoading } as KanbanState;
      }),

      on(events.addNewTask, ({ payload }) => (state: KanbanState) => {
        const newTask = getTask(null, { description: payload.description });
        const column = state.columns[ColumnEnum.backlog];
        const { tasks = {}, tasksOrder = [] } = column;

        const nextState = {
          ...state,
          columns: {
            ...state.columns,
            [column.name]: {
              ...column,
              tasks: { ...tasks, [newTask.uid]: newTask },
              tasksOrder: [...tasksOrder, newTask.uid],
            },
          },
        };

        return {
          ...nextState,
          neighbours: getNeighbours(nextState),
        };
      }),

      on(events.insertTask, ({ payload: { task, index, column: col } }) => (state: KanbanState) => {
        const column = state.columns[col];
        const columns = set(state.columns, col, addTask<Column>(column, task, index));
        const nextState = { ...state, columns };
        return { ...nextState, neighbours: getNeighbours(nextState) };
      }),

      on(events.removeTask, ({ payload: { task, column } }) => (state: KanbanState) => {
        state.columns[column] = removeTask(state.columns[column], task);
        const nextState = { ...state, columns: state.columns };
        return { ...nextState, neighbours: getNeighbours(nextState) };
      }),

      on(events.moveTask, ({ payload }) => (state: KanbanState) => {
        const { from, to, task, index } = payload;
        const nextState: KanbanState = {
          ...state,
          columns: {
            ...state.columns,
            [from]: removeTask(state.columns[from], task),
            [to]: addTask(state.columns[to], task, index),
          },
        };
        const neighbours = getNeighbours(nextState);
        return { ...nextState, neighbours };
      }),

      on(events.updateTask, ({ payload }) => (state: KanbanState) => {
        const { column, uid, data } = payload;
        state.columns[column] = updateTask(state.columns[column], uid, data);
        const nextState = { ...state, columns: state.columns };
        return { ...nextState, neighbours: getNeighbours(nextState) };
      }),

      on(events.updateSubtask, ({ payload }) => (state: KanbanState) => {
        console.log(payload);

        const column = updateSubtask(state.columns[payload.column], payload.tasksChain);
        const nextState = { ...state, columns: { ...state.columns, [column.name]: column } };

        return {
          ...nextState,
          neighbours: getNeighbours(nextState),
        };
      }),
    ),

    withEventHandlers((store, eventBus = inject(Events), http = inject(HttpService)) => {
      const dispatch = injectDispatch(events);

      return {
        load$: eventBus.on(events.load).pipe(
          tap(() => {
            dispatch.setLoading('columns');
          }),
          switchMap(() =>
            http.get(columnsApi).pipe(
              catchError((error: string) => {
                dispatch.setError({ status: 'columns', error });
                return of([]);
              }),
              tap((columns) => dispatch.loadColumns({ columns })),
              switchMap((columns) => {
                return http.get(tasksApi).pipe(
                  map((tasks) => dispatch.loadColumns({ columns, tasks })),
                  catchError((error: string) => {
                    dispatch.setError({ status: 'tasks', error });
                    return of({});
                  }),
                );
              }),
            ),
          ),
        ),
      };
    }),
  );
}

export const KanbanStore = signalStore(
  { providedIn: 'root' },
  withKanbanStore(KANBAN, createKanbanEvents(KANBAN)),
);
