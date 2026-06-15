import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-datos-pasajeros',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './datos-pasajeros.component.html',
  styleUrls: ['./datos-pasajeros.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatosPasajerosComponent implements OnInit {
  vuelo: any = null;
  asiento: any = null;
  precio: number = 0;
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  error: string = '';
  usuarioLogueado: any = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.vuelo = history.state.vuelo;
    this.asiento = history.state.asiento;
    this.precio = history.state.precio;

    // Obtener datos del usuario logueado
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.usuarioLogueado = user.user || user;

    // Pre-llenar con datos del usuario
    if (this.usuarioLogueado) {
      this.nombre = this.usuarioLogueado.nombre || '';
      this.apellido = this.usuarioLogueado.apellido || '';
      this.email = this.usuarioLogueado.email || '';
    }

    if (!this.vuelo || !this.asiento) {
      this.router.navigate(['/dashboard/cliente/buscar-vuelos']);
    }

    this.cdr.markForCheck();
  }

  volver(): void {
    window.history.back();
  }

  continuar(): void {
    if (!this.nombre.trim() || !this.apellido.trim()) {
      this.error = 'Por favor ingresa nombre y apellido del pasajero.';
      this.cdr.markForCheck();
      return;
    }

    this.router.navigate(['/dashboard/cliente/pago-qr'], {
      state: {
        vuelo: this.vuelo,
        asiento: this.asiento,
        precio: this.precio,
        pasajero: {
          nombre: this.nombre,
          apellido: this.apellido,
          email: this.email
        },
        usuarioId: this.usuarioLogueado?.userId
      }
    });
  }
}