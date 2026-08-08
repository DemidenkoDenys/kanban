import { Routes } from '@angular/router';
import { KanbanComponent } from './features/kanban/components/kanban-board/kanban-board.component';
import { KanbanStoreService } from './features/kanban/services/kanban.service';
import { KanbanUndoService } from '@kanban/services/kanbar-undo.service';

export const routes: Routes = [
  {
    path: 'kanban',
    providers: [KanbanStoreService, KanbanUndoService],
    loadComponent: () => KanbanComponent,
  },
  {
    path: '**',
    redirectTo: 'kanban'
  }
];
