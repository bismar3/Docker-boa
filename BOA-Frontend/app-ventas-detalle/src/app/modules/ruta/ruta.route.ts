import { Routes } from '@angular/router';
import { RutaListComponent } from './ruta-list/ruta-list.component';
import { RutaAddComponent } from './ruta-add/ruta-add.component';
import { RutaEditComponent } from './ruta-edit/ruta-edit.component';
import { RutaTramosComponent } from './ruta-tramos/ruta-tramos.component';

export const ruta_routes: Routes = [
  { path: 'list', component: RutaListComponent },
  { path: 'add', component: RutaAddComponent },
  { path: 'edit/:id', component: RutaEditComponent },
  { path: 'tramos/:id', component: RutaTramosComponent },
  { path: '**', redirectTo: 'list', pathMatch: 'full' },
];