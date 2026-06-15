import { Routes } from '@angular/router';
import { ClienteDashboardComponent } from './cliente-dashboard/cliente-dashboard.component';
import { BuscarVuelosComponent } from './buscar-vuelos/buscar-vuelos.component';
import { MisComprasComponent } from './mis-compras/mis-compras.component';
import { MisTicketsComponent } from './mis-tickets/mis-tickets.component';
import { MisReservasComponent } from './mis-reservas/mis-reservas.component';
import { SeleccionarAsientoComponent } from './seleccionar-asiento/seleccionar-asiento.component';
import { DatosPasajerosComponent } from './datos-pasajeros/datos-pasajeros.component';
import { PagoQrComponent } from './pago-qr/pago-qr.component';

export const cliente_routes: Routes = [
  { path: 'dashboard', component: ClienteDashboardComponent },
  { path: 'buscar-vuelos', component: BuscarVuelosComponent },
  { path: 'seleccionar-asiento/:id', component: SeleccionarAsientoComponent },
  { path: 'datos-pasajeros', component: DatosPasajerosComponent },
  { path: 'pago-qr', component: PagoQrComponent },
  { path: 'mis-compras', component: MisComprasComponent },
  { path: 'mis-tickets', component: MisTicketsComponent },
  { path: 'mis-reservas', component: MisReservasComponent },
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];