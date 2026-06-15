import { Routes } from '@angular/router';
import { TramoListComponent } from './tramo-list/tramo-list.component';
import { TramoAddComponent } from './tramo-add/tramo-add.component';

export const tramo_routes: Routes = [
  { path: 'list', component: TramoListComponent },
  { path: 'add', component: TramoAddComponent },
  { path: '**', redirectTo: 'list', pathMatch: 'full' },
];