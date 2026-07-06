import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Permiso } from '../../../interfaces/permiso.interface';
import { Rol } from '../../../interfaces/rol.interface';
import { PermisoService } from '../../permisos/permiso.service';
import { RolService } from '../../rol/rol.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-roles-permisos-add',
  imports: [CommonModule],
  templateUrl: './roles-permisos-add.component.html',
  styleUrl: './roles-permisos-add.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermisosAddComponent implements OnInit {
  permisos: Permiso[] = [];
  rol!: Rol;
  rolId!: number;
  selectedPermisos: Permiso[] | null = null;
  cargando: boolean = true;

  constructor(
    private permisoService: PermisoService,
    private rolService: RolService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.rolId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPermisos();
  }

  loadPermisos(): void {
    this.permisoService.getPermisos().subscribe({
      next: (permisos) => {
        this.permisos = permisos;
        this.cdr.markForCheck();
        this.loadRol();
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadRol(): void {
    this.rolService.getRolById(this.rolId).subscribe({
      next: (rol) => {
        this.rol = rol;
        if (this.rol.rolPermisos) {
          const permisosActivos = this.rol.rolPermisos.filter(rp => rp.acceso === true);
          this.selectedPermisos = this.permisos.filter((p) =>
            permisosActivos.some((rp) => rp.iD_Permiso === p.iD_Permiso)
          );
        } else {
          this.selectedPermisos = [];
        }
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }

  addPermission(permiso: Permiso, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (!this.selectedPermisos) {
      this.selectedPermisos = [];
    }

    if (isChecked) {
      this.selectedPermisos.push(permiso);
    } else {
      this.selectedPermisos = this.selectedPermisos.filter(
        (p) => p.iD_Permiso !== permiso.iD_Permiso
      );
    }
  }

  save(): void {
    if (!this.rol || !this.selectedPermisos) {
      console.warn('No hay permisos seleccionados o no hay información del rol.');
      return;
    }

    const permisosActivosPrevios = this.rol.rolPermisos?.filter(rp => rp.acceso === true) || [];

    const permisosACrear = this.selectedPermisos.filter(
      (p) => !this.rol.rolPermisos?.some((rp) => rp.iD_Permiso === p.iD_Permiso)
    );

    const permisosEliminados = permisosActivosPrevios.filter(
      (rp) => !this.selectedPermisos?.some((p) => p.iD_Permiso === rp.iD_Permiso)
    );

    if (permisosACrear.length === 0 && permisosEliminados.length === 0) {
      alert('No hay cambios en los permisos.');
      return;
    }

    const observables: Observable<any>[] = [];

    if (permisosACrear.length > 0) {
      permisosACrear.forEach((permiso) => {
        const rolPermiso = {
          iD_Rol: this.rol.iD_Rol,
          iD_Permiso: permiso.iD_Permiso,
          tabla: permiso.nombre_Permiso,
          acceso: true
        };
        observables.push(this.rolService.createRolPerimo(rolPermiso));
      });
    }

    if (permisosEliminados.length > 0) {
      permisosEliminados.forEach((p) => {
        observables.push(this.rolService.deleteRolPermisos(p.iD_Rol_Permiso));
      });
    }

    Promise.all(observables.map((obs) => obs.toPromise()))
      .then(() => {
        alert('✅ Cambios guardados con éxito. El usuario debe cerrar sesión y volver a entrar para ver los cambios.');
        this.router.navigate(['/dashboard/roles-permisos']);
      })
      .catch((error) => {
        console.error('Error al guardar cambios:', error);
      });
  }

  isSelected(permisoId: number): boolean {
    return this.selectedPermisos
      ? this.selectedPermisos.some((p) => p.iD_Permiso === permisoId)
      : false;
  }

  goBack() {
    this.router.navigate(['/dashboard/roles-permisos']);
  }
}