import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteAdminService, Cliente } from '../service/cliente-admin.service';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  cargando: boolean = true;
  filtroTexto: string = '';

  constructor(
    private clienteService: ClienteAdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesFiltrados = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  filtrar(): void {
    const texto = this.filtroTexto.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c =>
      !texto ||
      c.nombre.toLowerCase().includes(texto) ||
      c.apellido.toLowerCase().includes(texto) ||
      c.documento_Identidad.includes(texto)
    );
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.filtroTexto = '';
    this.clientesFiltrados = this.clientes;
    this.cdr.markForCheck();
  }

  verDetalle(cliente: Cliente): void {
    this.router.navigate(['/dashboard/cliente-admin/detalle', cliente.id], {
      state: { cliente }
    });
  }

  toggleBloqueo(cliente: Cliente): void {
    const nuevoEstado = cliente.estado === 'Bloqueado' ? 'Activo' : 'Bloqueado';
    if (!confirm(`¿Cambiar estado de ${cliente.nombre} a "${nuevoEstado}"?`)) return;

    const actualizado = { ...cliente, estado: nuevoEstado };
    this.clienteService.update(cliente.id, actualizado).subscribe({
      next: () => this.load(),
      error: () => alert('Error al actualizar estado')
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Activo': return 'bg-green-600';
      case 'Bloqueado': return 'bg-red-600';
      case 'En vuelo': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  }
}