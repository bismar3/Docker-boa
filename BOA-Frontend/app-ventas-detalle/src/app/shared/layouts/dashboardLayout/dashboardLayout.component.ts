import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { routes } from '../../../app.routes';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { Rol } from '../../../interfaces/rol.interface';
import { Permiso } from '../../../interfaces/permiso.interface';
import { User } from '../../../interfaces/user.interface';
import { ThemeService } from '../../services/theme.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SidebarComponent
  ],
  templateUrl: './dashboardLayout.component.html',
  styleUrl: './dashboardLayout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent implements OnInit, AfterViewInit {

  public userPermissions: Permiso[] = [];
  user: User | undefined;

  mostrarMenuUsuario: boolean = false;

  constructor(
    private router: Router,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const permissions = JSON.parse(sessionStorage.getItem('roles') || '[]');
    const user = JSON.parse(sessionStorage.getItem('user') || '[]');
    this.user = user;
    this.userPermissions = permissions.flatMap((rol: Rol) => rol.permisos);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.themeService.applyTheme(), 0);
  }

  public routes = routes.find(r => r.path === 'dashboard')?.children?.filter(route => route.data);

  hasPermission(permissionName: string): boolean {
    return this.userPermissions.some(perm => perm.nombre_Permiso === permissionName);
  }

  logout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  toggleMenuUsuario(): void {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
  }

  cerrarMenuUsuario(): void {
    this.mostrarMenuUsuario = false;
  }

  setColor(color: 'blue' | 'orange' | 'green'): void {
    this.themeService.setColor(color);
  }

  toggleModo(): void {
    this.themeService.toggleMode();
  }
}