import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroComponent {
  nombre: string = '';
  apellido: string = '';
  documento: string = '';
  fechaNacimiento: string = '';
  email: string = '';
  telefono: string = '';
  username: string = '';
  password: string = '';
  confirmarPassword: string = '';
  cargando: boolean = false;
  error: string = '';
  exito: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  registrar(): void {
    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      this.cdr.markForCheck();
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      this.cdr.markForCheck();
      return;
    }
    this.cargando = true;
    this.error = '';

    const body = {
      fullname: `${this.nombre} ${this.apellido}`,
      username: this.username,
      password: this.password,
      email: this.email,
      nombre: this.nombre,
      apellido: this.apellido,
      documento_Identidad: this.documento,
      fecha_Nacimiento: this.fechaNacimiento,
      telefono: this.telefono,
      rol_Id: 3,
      estado: 'Activo'
    };

    this.http.post<any>(
      `${environment.URL_SERVICIOS}/usuario/registro`,
      body,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).subscribe({
      next: (res) => {
        const usuarioId = res?.data?.userId ?? res?.data?.UserId;

        const clienteBody = {
          Nombre: this.nombre,
          Apellido: this.apellido,
          Documento_Identidad: this.documento,
          Fecha_Nacimiento: this.fechaNacimiento,
          Email: this.email,
          Telefono: this.telefono,
          Usuario_Id: usuarioId,
          Estado: 'Activo'
        };

        this.http.post<any>(
          `${environment.URL_SERVICIOS}/cliente`,
          clienteBody,
          { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
        ).subscribe({
          next: () => {
            this.exito = true;
            this.cargando = false;
            this.cdr.markForCheck();
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          },
          error: (err) => {
            this.error = 'Usuario creado, pero hubo un error al registrar el cliente. Contacta a soporte.';
            this.cargando = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.error = 'Error al registrar. Intenta de nuevo.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }
}