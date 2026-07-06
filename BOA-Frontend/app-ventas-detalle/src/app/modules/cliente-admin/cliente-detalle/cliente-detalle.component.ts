import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteAdminService, Cliente } from '../service/cliente-admin.service';

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-detalle.component.html',
  styleUrl: './cliente-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClienteDetalleComponent implements OnInit {
  cliente: Cliente | null = null;
  historial: any[] = [];
  cargando: boolean = true;
  clienteId: number = 0;

  constructor(
    private clienteService: ClienteAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cliente = history.state.cliente || null;
    this.loadHistorial();
  }

  loadHistorial(): void {
    this.clienteService.getHistorial(this.clienteId).subscribe({
      next: (data) => {
        this.historial = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get totalVuelos(): number {
    return this.historial.filter(h => h.estado === 'Confirmada').length;
  }

  get totalGastado(): number {
    return this.historial
      .filter(h => h.estado === 'Confirmada')
      .reduce((sum, h) => sum + h.monto_Total, 0);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Confirmada': return 'bg-green-600';
      case 'Pendiente': return 'bg-yellow-500';
      case 'Cancelada': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  }

  volver(): void {
    this.router.navigate(['/dashboard/cliente-admin/list']);
  }
}