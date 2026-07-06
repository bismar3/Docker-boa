import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuario-add',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './usuario-add.component.html',
  styleUrl: './usuario-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioAddComponent {
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(30)]],
      fullname: ['', [Validators.required, Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.email]],
      documento_Identidad: [''],
      telefono: [''],
      fecha_Nacimiento: [''],
      estado: ['Activo'],
    });
  }

  createUser(): void {
    if (this.userForm.valid) {
      const user = this.userForm.value;

      this.usuarioService.createUsuario(user).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado',
            text: 'El usuario se ha creado exitosamente.',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['/dashboard/user']);
            });
          });
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al crear el usuario. Inténtalo de nuevo.',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      console.log('Formulario inválido');
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/user']);
  }
}