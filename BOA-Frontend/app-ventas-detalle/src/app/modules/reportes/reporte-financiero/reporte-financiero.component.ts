import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

interface MovimientoFinanciero {
  id: number;
  codigo_Venta: string;
  monto: number;
  concepto?: string;
  motivo?: string;
  fecha: string;
  tipo: 'Ingreso' | 'Egreso';
}

@Component({
  selector: 'app-reporte-financiero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-financiero.component.html',
  styleUrl: './reporte-financiero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteFinancieroComponent implements OnInit {
  movimientos: MovimientoFinanciero[] = [];
  movimientosFiltrados: MovimientoFinanciero[] = [];
  cargando: boolean = true;

  fechaInicio: string = '';
  fechaFin: string = '';

  descargando: boolean = false;
  enviando: boolean = false;
  mostrarModalEmail: boolean = false;
  emailDestino: string = '';
  mensajeEnvio: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  load(): void {
    const headers = this.getHeaders();
    const urlIngresos = `${environment.URL_SERVICIOS}/ingreso`;
    const urlEgresos = `${environment.URL_SERVICIOS}/egreso`;

    this.http.get<any[]>(urlIngresos, { headers }).subscribe(ingresos => {
      this.http.get<any[]>(urlEgresos, { headers }).subscribe(egresos => {
        const ingresosMapeados: MovimientoFinanciero[] = ingresos.map(i => ({
          id: i.id,
          codigo_Venta: i.codigo_Venta,
          monto: i.monto,
          concepto: i.concepto,
          fecha: i.fecha,
          tipo: 'Ingreso'
        }));

        const egresosMapeados: MovimientoFinanciero[] = egresos.map(e => ({
          id: e.id,
          codigo_Venta: e.codigo_Venta,
          monto: e.monto,
          motivo: e.motivo,
          fecha: e.fecha,
          tipo: 'Egreso'
        }));

        this.movimientos = [...ingresosMapeados, ...egresosMapeados]
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        this.movimientosFiltrados = this.movimientos;
        this.cargando = false;
        this.cdr.markForCheck();
      });
    });
  }

  get totalIngresos(): number {
    return this.movimientosFiltrados.filter(m => m.tipo === 'Ingreso').reduce((s, m) => s + m.monto, 0);
  }

  get totalEgresos(): number {
    return this.movimientosFiltrados.filter(m => m.tipo === 'Egreso').reduce((s, m) => s + m.monto, 0);
  }

  get balance(): number {
    return this.totalIngresos - this.totalEgresos;
  }

  filtrar(): void {
    this.movimientosFiltrados = this.movimientos.filter(m => {
      const fecha = new Date(m.fecha);
      if (this.fechaInicio && fecha < new Date(this.fechaInicio)) return false;
      if (this.fechaFin && fecha > new Date(this.fechaFin + 'T23:59:59')) return false;
      return true;
    });
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.movimientosFiltrados = this.movimientos;
    this.cdr.markForCheck();
  }

  private construirQueryParams(): string {
    const params: string[] = [];
    if (this.fechaInicio) params.push(`desde=${this.fechaInicio}`);
    if (this.fechaFin) params.push(`hasta=${this.fechaFin}`);
    return params.length > 0 ? '?' + params.join('&') : '';
  }

  descargarPdf(): void {
    this.descargando = true;
    this.cdr.markForCheck();

    const url = `${environment.URL_SERVICIOS}/reporte/financiero/pdf${this.construirQueryParams()}`;

    this.http.get(url, { headers: this.getHeaders(), responseType: 'blob' }).subscribe({
      next: (blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `reporte-financiero-${new Date().getTime()}.pdf`;
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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    const body = {
      tipo: 'financiero',
      desde: this.fechaInicio || null,
      hasta: this.fechaFin || null,
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