import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VentaService } from '../../venta/service/venta.service';
import { VentaDetalle } from '../../../interfaces/venta.interface';

@Component({
  selector: 'app-reporte-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-ventas.component.html',
  styleUrl: './reporte-ventas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteVentasComponent implements OnInit {
  ventas: VentaDetalle[] = [];
  ventasFiltradas: VentaDetalle[] = [];
  cargando: boolean = true;

  fechaInicio: string = '';
  fechaFin: string = '';
  filtroEstado: string = 'Todos';
  filtroPago: string = 'Todos';

  constructor(
    private ventaService: VentaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.ventaService.getAllDetalle().subscribe({
      next: (data) => {
        this.ventas = data;
        this.ventasFiltradas = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get totalVentas(): number {
    return this.ventasFiltradas.length;
  }

  get totalConfirmadas(): number {
    return this.ventasFiltradas.filter(v => v.estado === 'Confirmada').length;
  }

  get totalCanceladas(): number {
    return this.ventasFiltradas.filter(v => v.estado === 'Cancelada').length;
  }

  get montoConfirmadas(): number {
    return this.ventasFiltradas
      .filter(v => v.estado === 'Confirmada')
      .reduce((sum, v) => sum + v.monto_Total, 0);
  }

  get porcentajeConfirmadas(): number {
    if (this.totalVentas === 0) return 0;
    return Math.round((this.totalConfirmadas / this.totalVentas) * 100);
  }

  get porcentajeCanceladas(): number {
    if (this.totalVentas === 0) return 0;
    return Math.round((this.totalCanceladas / this.totalVentas) * 100);
  }

  filtrar(): void {
    this.ventasFiltradas = this.ventas.filter(v => {
      const coincideEstado = this.filtroEstado === 'Todos' || v.estado === this.filtroEstado;
      const coincidePago = this.filtroPago === 'Todos' || v.metodo_Pago === this.filtroPago;
      return coincideEstado && coincidePago;
    });
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.filtroEstado = 'Todos';
    this.filtroPago = 'Todos';
    this.ventasFiltradas = this.ventas;
    this.cdr.markForCheck();
  }

  volver(): void {
    this.router.navigate(['/dashboard/reportes/dashboard']);
  }
}