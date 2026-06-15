import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './shared/layouts/dashboardLayout/dashboardLayout.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.route').then(m => m.auth_routes),
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'roles',
        loadChildren: () =>
          import('./modules/rol/rol.route').then(m => m.rol_routes),
        data: { icon: 'pi pi-users', title: 'Roles', description: 'Gestion de Roles', permission: 'Rol' },
      },
      {
        path: 'roles-permisos',
        loadChildren: () =>
          import('./modules/roles-permisos/roles-permisos.route').then(m => m.roles_permisos_routes),
        data: { icon: 'pi pi-users', title: 'Asignacion de Permisos a los Roles', description: 'Gestion de Asignacion de Permisos a los Roles', permission: 'Rol Permiso' },
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./modules/usuario/usuario.route').then(m => m.usuario_routes),
        data: { icon: 'pi pi-users', title: 'Usuario', description: 'Gestion de Usuarios', permission: 'Usuario' },
      },
      {
        path: 'roles-permisos-usuario',
        loadChildren: () =>
          import('./modules/roles-permisos-usuario/roles-permisos-usuario.route').then(m => m.roles_permisos_usuario_routes),
        data: { icon: 'pi pi-users', title: 'Asignacion de Roles a Usuarios', description: 'Gestion de Asignacion de Roles a los Usuario', permission: 'Asignacion Roles y Permisos' },
      },
      {
        path: 'aeropuerto',
        loadChildren: () =>
          import('./modules/aeropuerto/aeropuerto.route').then(m => m.aeropuerto_routes),
        data: { icon: 'pi pi-map-marker', title: 'Aeropuerto', description: 'Gestion de Aeropuertos', permission: 'Aeropuerto' },
      },
      {
        path: 'aeronave',
        loadChildren: () =>
          import('./modules/aeronave/aeronave.route').then(m => m.aeronave_routes),
        data: { icon: 'pi pi-send', title: 'Aeronave', description: 'Gestion de Aeronaves', permission: 'Aeronave' },
      },
      {
        path: 'empleado',
        loadChildren: () =>
          import('./modules/empleado/empleado.route').then(m => m.empleado_routes),
        data: { icon: 'pi pi-id-card', title: 'Empleado', description: 'Gestion de Empleados', permission: 'Tripulacion' },
      },
      {
        path: 'ruta',
        loadChildren: () =>
          import('./modules/ruta/ruta.route').then(m => m.ruta_routes),
        data: { icon: 'pi pi-directions', title: 'Ruta', description: 'Gestion de Rutas', permission: 'Ruta' },
      },
      {
        path: 'tramo',
        loadChildren: () =>
          import('./modules/tramo/tramo.route').then(m => m.tramo_routes),
        data: { icon: 'pi pi-map', title: 'Tramo', description: 'Gestion de Tramos', permission: 'Ruta' },
      },
      {
        path: 'programacion-vuelo',
        loadChildren: () =>
          import('./modules/programacion-vuelo/programacion-vuelo.route').then(m => m.programacion_vuelo_routes),
        data: { icon: 'pi pi-calendar', title: 'Programacion de Vuelos', description: 'Gestion de Programacion de Vuelos', permission: 'ProgramacionVuelo' },
      },
      {
        path: 'tipo-clase',
        loadChildren: () =>
          import('./modules/tipo-clase/tipo-clase.route').then(m => m.tipo_clase_routes),
        data: { icon: 'pi pi-star', title: 'Tipo de Clase', description: 'Gestion de Tipos de Clase', permission: 'Aeronave' },
      },
          {
  path: 'ventas',
  loadChildren: () =>
    import('./modules/venta/venta.route').then(m => m.venta_routes),
  data: { icon: 'pi pi-shopping-cart', title: 'Ventas', description: 'Gestionar Ventas', permission: 'Venta' },
},
      {
        path: 'cliente',
        loadChildren: () =>
          import('./modules/cliente/cliente.route').then(m => m.cliente_routes),
        data: { icon: 'pi pi-ticket', title: 'Buscar Vuelos', description: 'Buscar Vuelos Disponibles', permission: 'Venta' },
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];