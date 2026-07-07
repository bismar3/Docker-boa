import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VentaService } from '../../venta/service/venta.service';
import { VentaDetalle } from '../../../interfaces/venta.interface';
import { environment } from '../../../../environments/environment.development';

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
  filtroCliente: string = '';

  descargando: boolean = false;
  enviando: boolean = false;
  mostrarModalEmail: boolean = false;
  emailDestino: string = '';
  mensajeEnvio: string = '';

  constructor(
    private ventaService: VentaService,
    private router: Router,
    private http: HttpClient,
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
      const coincideCliente = !this.filtroCliente.trim() ||
        v.cliente_Nombre?.toLowerCase().includes(this.filtroCliente.toLowerCase());

      let coincideFecha = true;
      const fechaVenta = v.created_At ? new Date(v.created_At) : null;
      if (fechaVenta) {
        if (this.fechaInicio && fechaVenta < new Date(this.fechaInicio)) coincideFecha = false;
        if (this.fechaFin && fechaVenta > new Date(this.fechaFin + 'T23:59:59')) coincideFecha = false;
      }

      return coincideEstado && coincidePago && coincideCliente && coincideFecha;
    });
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.filtroEstado = 'Todos';
    this.filtroPago = 'Todos';
    this.filtroCliente = '';
    this.ventasFiltradas = this.ventas;
    this.cdr.markForCheck();
  }

  private construirQueryParams(): string {
    const params: string[] = [];
    if (this.fechaInicio) params.push(`desde=${this.fechaInicio}`);
    if (this.fechaFin) params.push(`hasta=${this.fechaFin}`);
    if (this.filtroEstado !== 'Todos') params.push(`estado=${encodeURIComponent(this.filtroEstado)}`);
    if (this.filtroPago !== 'Todos') params.push(`metodoPago=${encodeURIComponent(this.filtroPago)}`);
    return params.length > 0 ? '?' + params.join('&') : '';
  }

  descargarPdf(): void {
    this.descargando = true;
    this.cdr.markForCheck();

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const url = `${environment.URL_SERVICIOS}/reporte/ventas/pdf${this.construirQueryParams()}`;

    this.http.get(url, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `reporte-ventas-${new Date().getTime()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(urlBlob);
        this.descargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        alert('Error al descargar el PDF.');
        this.descargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirModalEmail(): void {
    this.emailDestino = '';
    this.mensajeEnvio = '';
    this.mostrarModalEmail = true;
    this.cdr.markForCheck();
  }

  cerrarModalEmail(): void {
    this.mostrarModalEmail = false;
    this.cdr.markForCheck();
  }

  enviarPorCorreo(): void {
    if (!this.emailDestino.trim()) {
      this.mensajeEnvio = 'Ingresá un email válido.';
      this.cdr.markForCheck();
      return;
    }

    this.enviando = true;
    this.mensajeEnvio = '';
    this.cdr.markForCheck();

    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      tipo: 'ventas',
      desde: this.fechaInicio || null,
      hasta: this.fechaFin || null,
      estado: this.filtroEstado,
      metodoPago: this.filtroPago,
      email: this.emailDestino
    };

    this.http.post<any>(`${environment.URL_SERVICIOS}/reporte/enviar`, body, { headers }).subscribe({
      next: (res) => {
        this.mensajeEnvio = res.message || 'Reporte enviado correctamente.';
        this.enviando = false;
        this.cdr.markForCheck();
        setTimeout(() => this.cerrarModalEmail(), 2000);
      },
      error: (err) => {
        this.mensajeEnvio = err.error?.message || 'Error al enviar el reporte.';
        this.enviando = false;
        this.cdr.markForCheck();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/dashboard/reportes/dashboard']);
  }
}