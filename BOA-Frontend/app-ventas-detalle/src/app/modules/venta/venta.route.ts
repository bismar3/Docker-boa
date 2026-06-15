import { Routes } from '@angular/router';

export const venta_routes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./ventas-list/ventas-list.component').then(m => m.VentasListComponent)
  },
  {
    path: '**',
    redirectTo: 'list'
  }
];