import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmpleadoService } from '../service/empleado.service';
import { Empleado } from '../../../interfaces/empleado.interface';

@Component({
  selector: 'app-empleado-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empleado-list.component.html',
  styleUrls: ['./empleado-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpleadoListComponent implements OnInit {
  empleados: Empleado[] = [];
  constructor(private empleadoService: EmpleadoService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.empleadoService.getAll().subscribe(data => {
      this.empleados = data;
      this.cdr.markForCheck();
    });
  }
  delete(id: number): void {
    if (confirm('¿Eliminar este empleado?')) {
      this.empleadoService.delete(id).subscribe(() => this.load());
    }
  }
}