import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-reporte-financiero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-financiero.component.html',
  styleUrl: './reporte-financiero.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReporteFinancieroComponent implements OnInit {
  ingresos: any[] = [];
  egresos: any[] = [];
  cargando: boolean = true;

  fechaInicio: string = '';
  fechaFin: string = '';

  descargando: boolean = false;
  enviando: boolean = false;
  mostrarModalEmail: boolean = false;
  emailDestino: string = '';
  mensajeEnvio: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private headers(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  load(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    this.http.get<any[]>(`${environment.URL_SERVICIOS}/ingreso`, { headers: this.headers() }).subscribe({
      next: (ingresos) => {
        this.ingresos = ingresos;
        this.http.get<any[]>(`${environment.URL_SERVICIOS}/egreso`, { headers: this.headers() }).subscribe({
          next: (egresos) => {
            this.egresos = egresos;
            this.cargando = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.cargando = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get ingresosFiltrados(): any[] {
    return this.filtrarPorFecha(this.ingresos);
  }

  get egresosFiltrados(): any[] {
    return this.filtrarPorFecha(this.egresos);
  }

  private filtrarPorFecha(lista: any[]): any[] {
    if (!this.fechaInicio && !this.fechaFin) return lista;
    return lista.filter(item => {
      const fecha = new Date(item.fecha);
      if (this.fechaInicio && fecha < new Date(this.fechaInicio)) return false;
      if (this.fechaFin && fecha > new Date(this.fechaFin + 'T23:59:59')) return false;
      return true;
    });
  }

  get totalIngresos(): number {
    return this.ingresosFiltrados.reduce((sum, i) => sum + i.monto, 0);
  }

  get totalEgresos(): number {
    return this.egresosFiltrados.reduce((sum, e) => sum + e.monto, 0);
  }

  get balance(): number {
    return this.totalIngresos - this.totalEgresos;
  }

  filtrar(): void {
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
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

    this.http.get(url, { headers: this.headers(), responseType: 'blob' }).subscribe({
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

    const body = {
      tipo: 'financiero',
      desde: this.fechaInicio || null,
      hasta: this.fechaFin || null,
      email: this.emailDestino
    };

    this.http.post<any>(`${environment.URL_SERVICIOS}/reporte/enviar`, body, { headers: this.headers() }).subscribe({
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