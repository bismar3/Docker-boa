import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-compras.component.html',
  styleUrl: './mis-compras.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MisComprasComponent implements OnInit {
  compras: any[] = [];
  cargando: boolean = true;
  clienteId: number = 0;
  ventaSeleccionada: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const userData = user.user || user;
    this.clienteId = userData.userId;
    this.load();
  }

  load(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any[]>(
      `${environment.URL_SERVICIOS}/venta/detalle/cliente/${this.clienteId}`,
      { headers }
    ).subscribe({
      next: (data) => {
        this.compras = data.filter(v => v.estado === 'Confirmada');
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  verDetalle(venta: any): void {
    this.ventaSeleccionada = this.ventaSeleccionada?.id === venta.id ? null : venta;
    this.cdr.markForCheck();
  }

  buscarVuelos(): void {
    this.router.navigate(['/dashboard/cliente/buscar-vuelos']);
  }
}