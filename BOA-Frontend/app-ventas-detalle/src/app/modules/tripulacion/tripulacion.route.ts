import { Routes } from '@angular/router';

export const tripulacion_routes: Routes = [
  {
    path: 'gestion',
    loadComponent: () =>
      import('./tripulacion-gestion/tripulacion-gestion.component').then(m => m.TripulacionGestionComponent)
  },
  {
    path: '**',
    redirectTo: 'gestion'
  }
];