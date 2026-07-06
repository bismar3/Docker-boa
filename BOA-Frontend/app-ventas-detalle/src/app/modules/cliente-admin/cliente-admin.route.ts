import { Routes } from '@angular/router';

export const cliente_admin_routes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./cliente-list/cliente-list.component').then(m => m.ClienteListComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./cliente-detalle/cliente-detalle.component').then(m => m.ClienteDetalleComponent)
  },
  {
    path: '**',
    redirectTo: 'list'
  }
];