import { Routes } from '@angular/router';
import { KanbanComponent } from './features/kanban/components/kanban-board/kanban-board.component';
import { KanbanStoreService } from './features/kanban/services/kanban.service';

export const routes: Routes = [
  {
    path: 'kanban',
    providers: [KanbanStoreService],
    loadComponent: () => KanbanComponent,
  },
  {
    path: '**',
    redirectTo: 'kanban'
  }
];
