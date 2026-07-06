import { Routes } from '@angular/router';

export const egreso_routes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./egreso-list/egreso-list.component').then(m => m.EgresoListComponent)
  },
  {
    path: '**',
    redirectTo: 'list'
  }
];