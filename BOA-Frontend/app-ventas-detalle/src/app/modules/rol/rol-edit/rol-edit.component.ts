import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../rol.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rol-edit',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './rol-edit.component.html',
  styleUrl: './rol-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolEditComponent implements OnInit {
  rolForm!: FormGroup;
  rolId!: number;
  cargando: boolean = true;

  constructor(
    private fb: FormBuilder,
    private rolService: RolService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rolId = +this.route.snapshot.paramMap.get('id')!;

    this.rolForm = this.fb.group({
      nombre_Rol: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(30)]],
    });

    this.rolService.getRolById(this.rolId).subscribe({
      next: (rol) => {
        this.rolForm.patchValue({
          nombre_Rol: rol.nombre_Rol,
          descripcion: rol.descripcion
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

  save(): void {
    if (this.rolForm.invalid) return;

    const rolActualizado = {
      iD_Rol: this.rolId,
      ...this.rolForm.value
    };

    this.rolService.updateRol(this.rolId, rolActualizado).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Rol actualizado',
          text: 'Los cambios se guardaron exitosamente.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/dashboard/roles/list']);
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar el rol.',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/roles/list']);
  }
}