export const KanbanColumnName = {
  backlog: 'backlog',
  todo: 'todo',
  ongoing: 'ongoing',
  done: 'done',
} as const;

export type KanbanColumnNames = keyof typeof KanbanColumnName;
