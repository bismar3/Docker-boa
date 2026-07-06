import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EgresoService, Egreso } from '../service/egreso.service';

@Component({
  selector: 'app-egreso-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './egreso-list.component.html',
  styleUrl: './egreso-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EgresoListComponent implements OnInit {
  egresos: Egreso[] = [];
  egresosFiltrados: Egreso[] = [];
  cargando: boolean = true;
  filtroTexto: string = '';

  constructor(
    private egresoService: EgresoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.egresoService.getAll().subscribe({
      next: (data) => {
        this.egresos = data.sort((a, b) => b.id - a.id);
        this.egresosFiltrados = this.egresos;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get totalEgresos(): number {
    return this.egresos.reduce((sum, e) => sum + e.monto, 0);
  }

  get totalRegistros(): number {
    return this.egresos.length;
  }

  filtrar(): void {
    const texto = this.filtroTexto.toLowerCase();
    this.egresosFiltrados = this.egresos.filter(e =>
      !texto ||
      e.codigo_Venta.toLowerCase().includes(texto) ||
      e.programacion_Vuelo_Id.toString().includes(texto)
    );
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.filtroTexto = '';
    this.egresosFiltrados = this.egresos;
    this.cdr.markForCheck();
  }
}