import { Routes } from '@angular/router';
import { ProgramacionListComponent } from './programacion-list/programacion-list.component';
import { ProgramacionAddComponent } from './programacion-add/programacion-add.component';

export const programacion_vuelo_routes: Routes = [
  { path: 'list', component: ProgramacionListComponent },
  { path: 'add', component: ProgramacionAddComponent },
  { path: '**', redirectTo: 'list', pathMatch: 'full' },
];