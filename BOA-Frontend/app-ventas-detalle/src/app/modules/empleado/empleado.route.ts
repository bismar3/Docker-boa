import { Routes } from '@angular/router';
import { EmpleadoListComponent } from './empleado-list/empleado-list.component';
import { EmpleadoAddComponent } from './empleado-add/empleado-add.component';

export const empleado_routes: Routes = [
  { path: 'list', component: EmpleadoListComponent },
  { path: 'add', component: EmpleadoAddComponent },
  { path: '**', redirectTo: 'list', pathMatch: 'full' },
];