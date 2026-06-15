import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EmpleadoService } from '../service/empleado.service';
import { Empleado } from '../../../interfaces/empleado.interface';

@Component({
  selector: 'app-empleado-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './empleado-add.component.html',
  styleUrls: ['./empleado-add.component.css']
})
export class EmpleadoAddComponent {
  empleado: Empleado = { nombre: '', apellido: '', cargo: 'Piloto', licencia: '', estado: 'Activo' };
  constructor(private empleadoService: EmpleadoService, private router: Router) {}
  save(): void {
    this.empleadoService.create(this.empleado).subscribe(() => {
      this.router.navigate(['/dashboard/empleado/list']);
    });
  }
}