import { Routes } from '@angular/router';
import { TipoClaseListComponent } from './tipo-clase-list/tipo-clase-list.component';
import { TipoClaseAddComponent } from './tipo-clase-add/tipo-clase-add.component';

export const tipo_clase_routes: Routes = [
  { path: 'list', component: TipoClaseListComponent },
  { path: 'add', component: TipoClaseAddComponent },
  { path: '**', redirectTo: 'list', pathMatch: 'full' },
];