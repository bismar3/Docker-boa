import { Routes } from '@angular/router';

export const ingreso_routes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./ingreso-list/ingreso-list.component').then(m => m.IngresoListComponent)
  },
  {
    path: '**',
    redirectTo: 'list'
  }
];