import { KanbanUndoService } from '../services/kanbar-undo.service';
import { KanbanService } from '../services/kanban.service';

export function WithUndoRedo() {
  return function (service: KanbanService, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const service = this as KanbanService;
      const undoService = service.undoService as KanbanUndoService;

      if (!undoService) {
        return originalMethod.apply(this, args);
      }

      if (undoService && typeof undoService.saveUndoState === 'function') {
        undoService.saveUndoState(structuredClone(service.store.columns()));
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
