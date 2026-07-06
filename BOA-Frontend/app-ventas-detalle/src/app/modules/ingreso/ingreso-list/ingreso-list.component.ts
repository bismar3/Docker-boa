import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngresoService, Ingreso } from '../service/ingreso.service';

@Component({
  selector: 'app-ingreso-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ingreso-list.component.html',
  styleUrl: './ingreso-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IngresoListComponent implements OnInit {
  ingresos: Ingreso[] = [];
  ingresosFiltrados: Ingreso[] = [];
  cargando: boolean = true;
  filtroTexto: string = '';

  constructor(
    private ingresoService: IngresoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.ingresoService.getAll().subscribe({
      next: (data) => {
        this.ingresos = data.sort((a, b) => b.id - a.id);
        this.ingresosFiltrados = this.ingresos;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get totalIngresos(): number {
    return this.ingresos
      .filter(i => i.estado === 'Aprobado')
      .reduce((sum, i) => sum + i.monto, 0);
  }

  get totalRegistros(): number {
    return this.ingresos.length;
  }

  filtrar(): void {
    const texto = this.filtroTexto.toLowerCase();
    this.ingresosFiltrados = this.ingresos.filter(i =>
      !texto ||
      i.codigo_Venta.toLowerCase().includes(texto) ||
      i.programacion_Vuelo_Id.toString().includes(texto)
    );
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.filtroTexto = '';
    this.ingresosFiltrados = this.ingresos;
    this.cdr.markForCheck();
  }
}