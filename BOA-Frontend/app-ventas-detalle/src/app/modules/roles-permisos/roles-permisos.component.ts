import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Rol } from '../../interfaces/rol.interface';
import { RolService } from '../rol/rol.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermisoService } from '../permisos/permiso.service';
import { Permiso } from '../../interfaces/permiso.interface';

@Component({
  selector: 'app-roles-permisos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './roles-permisos.component.html',
  styleUrl: './roles-permisos.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermisosComponent implements OnInit {
  roles: Rol[] = [];
  permisos: Permiso[] = [];
  searchTerm: string = '';

  constructor(
    private rolesService: RolService,
    private permisosService: PermisoService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reloadPermisos();
  }

  get filteredRoles(): Rol[] {
    if (!this.searchTerm.trim()) return this.roles;
    const texto = this.searchTerm.toLowerCase();
    return this.roles.filter(r => r.nombre_Rol?.toLowerCase().includes(texto));
  }

  onSearchChange(): void {
    this.cdr.markForCheck();
  }

  reloadPermisos(): void {
    this.permisosService.getPermisos().subscribe({
      next: (data) => {
        this.permisos = data;
        this.reloadRoles();
      },
      error: (err) => {
        console.error('Error al cargar los permisos:', err);
        this.cdr.markForCheck();
      }
    });
  }

  reloadRoles(): void {
    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles.map(rol => ({
          ...rol,
          rolPermisos: rol.rolPermisos?.map(permiso => ({
            ...permiso,
            nombrePermiso: this.permisos.find(p => p.iD_Permiso === permiso.iD_Permiso)?.nombre_Permiso
          }))
        }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar los roles:', err);
        this.cdr.markForCheck();
      }
    });
  }
}