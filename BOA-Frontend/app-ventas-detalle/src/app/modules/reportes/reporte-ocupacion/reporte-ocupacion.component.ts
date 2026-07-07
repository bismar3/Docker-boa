import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

interface OcupacionVuelo {
  programacionId: number;
  codigo_Vuelo: string;
  fecha_Salida: string;
  hora_Salida: string;
  total_Asientos: number;
  asientos_Ocupados: number;
  porcentaje_Ocupacion: number;
}

@Component({
  selector: 'app-reporte-ocupacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-ocupacion.component.html',
  styleUrl: './reporte-ocupacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteOcupacionComponent implements OnInit {
  vuelos: OcupacionVuelo[] = [];
  vuelosFiltrados: OcupacionVuelo[] = [];
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
    const url = `${environment.URL_SERVICIOS}/programacionvuelo/ocupacion`;
    this.http.get<OcupacionVuelo[]>(url, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.vuelos = data;
        this.vuelosFiltrados = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get promedioOcupacion(): number {
    if (this.vuelosFiltrados.length === 0) return 0;
    const suma = this.vuelosFiltrados.reduce((s, v) => s + v.porcentaje_Ocupacion, 0);
    return Math.round((suma / this.vuelosFiltrados.length) * 10) / 10;
  }

  private normalizarFecha(fecha: string): string {
    if (!fecha) return '';
    return fecha.split(' ')[0];
  }

  filtrar(): void {
    this.vuelosFiltrados = this.vuelos.filter(v => {
      const fechaStr = this.normalizarFecha(v.fecha_Salida);
      const fecha = new Date(fechaStr);
      if (this.fechaInicio && fecha < new Date(this.fechaInicio)) return false;
      if (this.fechaFin && fecha > new Date(this.fechaFin + 'T23:59:59')) return false;
      return true;
    });
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.vuelosFiltrados = this.vuelos;
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

    const url = `${environment.URL_SERVICIOS}/reporte/ocupacion/pdf${this.construirQueryParams()}`;

    this.http.get(url, { headers: this.getHeaders(), responseType: 'blob' }).subscribe({
      next: (blob) => {
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = `reporte-ocupacion-${new Date().getTime()}.pdf`;
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
      tipo: 'ocupacion',
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