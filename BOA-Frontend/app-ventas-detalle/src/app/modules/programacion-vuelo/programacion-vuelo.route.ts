import { Routes } from '@angular/router';
import { ProgramacionListComponent } from './programacion-list/programacion-list.component';
import { ProgramacionAddComponent } from './programacion-add/programacion-add.component';
import { ProgramacionEditComponent } from './programacion-edit/programacion-edit.component';
import { ProgramacionViewComponent } from './programacion-view/programacion-view.component';
import { ProgramacionReprogramarComponent } from './programacion-reprogramar/programacion-reprogramar.component';

export const programacion_vuelo_routes: Routes = [
  { path: 'list', component: ProgramacionListComponent },
  { path: 'add', component: ProgramacionAddComponent },
  { path: 'edit/:id', component: ProgramacionEditComponent },
  { path: 'view/:id', component: ProgramacionViewComponent },
  { path: 'reprogramar/:id', component: ProgramacionReprogramarComponent },
  { path: '**', redirectTo: 'list', pathMatch: 'full' },
];