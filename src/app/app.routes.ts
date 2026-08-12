import { Routes } from '@angular/router';
import { KanbanService } from './features/kanban/services/kanban.service';
import { KanbanComponent } from './features/kanban/components/kanban-board/kanban-board.component';
import { KanbanUndoService } from '@kanban/services/kanbar-undo.service';

export const routes: Routes = [
  {
    path: 'kanban',
    providers: [ KanbanService, KanbanUndoService],
    loadComponent: () => KanbanComponent,
  },
  {
    path: '**',
    redirectTo: 'kanban'
  }
];
