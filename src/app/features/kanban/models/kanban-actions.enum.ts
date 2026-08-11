export const KeyboardAction = {
  focusUp: 'focusUp',
  focusDown: 'focusDown',
  focusLeft: 'focusLeft',
  focusRight: 'focusRight',
  moveNext: 'moveNext',
  moveBack: 'moveBack',
  delete: 'delete',
  undo: 'undo',
  redo: 'redo',
  _none: '_none',
} as const;
export type KeyboardActions = keyof typeof KeyboardAction;
