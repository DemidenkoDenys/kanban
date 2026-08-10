import { computed, Injectable, signal } from '@angular/core';
import { Kanban } from '@kanban/models/kanban.models';
import { cloneDeep } from 'lodash-es';

@Injectable()
export class KanbanUndoService {
  /**
   * @description The service should be reimplemented to store state diffs instead of full state copies,
   * with a strict limit on the maximum number of stored actions.
   */

  private readonly actions = signal<Array<Kanban>>([]);
  private readonly undones = signal<Array<Kanban>>([]);

  public isUndoPossible = computed<boolean>(() => this.actions().length > 0);
  public isRedoPossible = computed<boolean>(() => this.undones().length > 0);

  addAction(kanban: Kanban): void {
    const kanbanCopy = cloneDeep(kanban);
    this.actions.update((actions) => [...actions, kanbanCopy]);
    this.undones.set([]);
  }

  undoAction(kanban: Kanban): Kanban | null {
    if (!this.isUndoPossible()) {
      return null;
    }

    const lastAction = cloneDeep(this.actions().at(-1));

    if (lastAction) {
      this.actions.update((actions) => actions.slice(0, -1));
      this.undones.update((undones) => [...undones, kanban]);
      return lastAction;
    }

    return null;
  }

  redoAction(): Kanban | null {
    if (!this.isRedoPossible()) {
      return null;
    }

    const lastUndone = this.undones().at(-1);

    if (lastUndone) {
      this.undones.update((undones) => undones.slice(0, -1));
      return lastUndone;
    }

    return null;
  }
}
