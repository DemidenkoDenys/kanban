import { KanbanUndoService } from '../services/kanbar-undo.service';
import { KanbanStoreService } from '../services/kanban.service';

export function WithUndoRedo() {
  return function (service: KanbanStoreService, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const service = this as KanbanStoreService;

      if (!service.undoService) {
        return originalMethod.apply(this, args);
      }

      const undoService = service.undoService as KanbanUndoService;
      if (undoService && typeof undoService.saveUndoState === 'function') {
        undoService.saveUndoState(service.kanban());
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
