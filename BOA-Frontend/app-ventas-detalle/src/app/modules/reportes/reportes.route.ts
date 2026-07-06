import { Routes } from '@angular/router';

export const reportes_routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./reportes-dashboard/reportes-dashboard.component').then(m => m.ReportesDashboardComponent)
  },
  {
    path: 'ventas',
    loadComponent: () =>
      import('./reporte-ventas/reporte-ventas.component').then(m => m.ReporteVentasComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];