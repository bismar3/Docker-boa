import { Routes } from '@angular/router';

export const consultar_vuelo_routes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./consultar-vuelo-list/consultar-vuelo-list.component').then(m => m.ConsultarVueloListComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./consultar-vuelo-detalle/consultar-vuelo-detalle.component').then(m => m.ConsultarVueloDetalleComponent)
  },
  {
    path: '**',
    redirectTo: 'list'
  }
];