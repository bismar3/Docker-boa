import { Routes } from '@angular/router';

export const salida_routes: Routes = [
  {
    path: 'list',
    loadComponent: () =>
      import('./salida-list/salida-list.component').then(m => m.SalidaListComponent)
  },
  {
    path: '**',
    redirectTo: 'list'
  }
];