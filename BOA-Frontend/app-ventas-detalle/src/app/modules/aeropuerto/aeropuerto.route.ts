import { Routes } from '@angular/router';
import { AeropuertoListComponent } from './aeropuerto-list/aeropuerto-list.component';
import { AeropuertoAddComponent } from './aeropuerto-add/aeropuerto-add.component';
import { AeropuertoEditComponent } from './aeropuerto-edit/aeropuerto-edit.component';

export const aeropuerto_routes: Routes = [
  {
    path: 'list',
    component: AeropuertoListComponent,
  },
  {
    path: 'add',
    component: AeropuertoAddComponent
  },
  {
    path: 'edit/:id',
    component: AeropuertoEditComponent
  },
  {
    path: '**',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];