import { Routes } from '@angular/router';
import { AeronaveListComponent } from './aeronave-list/aeronave-list.component';
import { AeronaveAddComponent } from './aeronave-add/aeronave-add.component';

export const aeronave_routes: Routes = [
  { path: 'list', component: AeronaveListComponent },
  { path: 'add', component: AeronaveAddComponent },
  { path: '**', redirectTo: 'list', pathMatch: 'full' },
];