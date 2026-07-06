import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../usuario.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './usuario-edit.component.html',
  styleUrl: './usuario-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioEditComponent implements OnInit {
  userForm!: FormGroup;
  userId!: number;
  cargando: boolean = true;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = +this.route.snapshot.paramMap.get('id')!;

    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(30)]],
      fullname: ['', [Validators.required, Validators.maxLength(30)]],
      password: ['', [Validators.maxLength(30)]],
      email: ['', [Validators.email]],
      documento_Identidad: [''],
      telefono: [''],
      fecha_Nacimiento: [''],
      estado: ['Activo'],
    });

    this.usuarioService.getUsuarioById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          documento_Identidad: user.documento_Identidad,
          telefono: user.telefono,
          fecha_Nacimiento: this.soloFecha(user.fecha_Nacimiento),
          estado: user.estado || 'Activo',
        });
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  private soloFecha(valor?: string): string {
    if (!valor) return '';
    return valor.substring(0, 10);
  }

  save(): void {
    if (this.userForm.invalid) return;

    const valores = { ...this.userForm.value };
    if (!valores.password) {
      delete valores.password;
    }

    const usuarioActualizado = {
      userId: this.userId,
      ...valores
    };

    this.usuarioService.updateUsuario(this.userId, usuarioActualizado).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario actualizado',
          text: 'Los cambios se guardaron exitosamente.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/dashboard/user/list']);
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar el usuario.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/user/list']);
  }
}