import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BuscarVueloService, VueloDisponible } from '../service/buscar-vuelo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { RutaTramoService, RutaTramo } from '../../ruta/service/ruta-tramo.service';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-buscar-vuelos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buscar-vuelos.component.html',
  styleUrls: ['./buscar-vuelos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuscarVuelosComponent implements OnInit {
  aeropuertos: Aeropuerto[] = [];
  vuelosFiltrados: VueloDisponible[] = [];
  tramosMap: { [rutaId: number]: RutaTramo[] } = {};

  origenId: number = 0;
  destinoId: number = 0;
  fecha: string = '';
  buscado: boolean = false;
  hoy: string = new Date().toISOString().split('T')[0];

  constructor(
    private buscarVueloService: BuscarVueloService,
    private aeropuertoService: AeropuertoService,
    private rutaTramoService: RutaTramoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.aeropuertoService.getAll().subscribe(data => {
      this.aeropuertos = data;
      this.cdr.markForCheck();
    });
  }

  getNombreAeropuerto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.nombre} (${a.codigo_IATA})` : `ID: ${id}`;
  }

  getCodigoIATA(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? a.codigo_IATA : '?';
  }

  getCiudad(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? a.ciudad : '';
  }

  tieneEscalas(vuelo: VueloDisponible): boolean {
    const tramos = this.tramosMap[vuelo.ruta_Id] || [];
    return tramos.length > 1;
  }

  getEscalas(vuelo: VueloDisponible): RutaTramo[] {
    return this.tramosMap[vuelo.ruta_Id] || [];
  }

  buscar(): void {
    if (!this.origenId || !this.destinoId || !this.fecha) return;
    if (this.origenId === this.destinoId) return;

    this.buscarVueloService.getAll().subscribe(data => {
      this.buscado = true;

      this.vuelosFiltrados = data.filter(v => {
        const partes = v.fecha_Salida.split(' ')[0].split('/');
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const anio = partes[2];
        const fechaVueloStr = `${anio}-${mes}-${dia}`;

        return v.aeropuerto_Origen_Id === Number(this.origenId) &&
          v.aeropuerto_Destino_Id === Number(this.destinoId) &&
          fechaVueloStr === this.fecha &&
          v.estado === 'Programado';
      });

      if (this.vuelosFiltrados.length === 0) {
        this.vuelosFiltrados = data.filter(v => {
          const partes = v.fecha_Salida.split(' ')[0].split('/');
          const dia = partes[0].padStart(2, '0');
          const mes = partes[1].padStart(2, '0');
          const anio = partes[2];
          const fechaVueloStr = `${anio}-${mes}-${dia}`;
          const fechaBuscada = new Date(this.fecha);
          const fechaVuelo = new Date(fechaVueloStr);
          const diff = Math.abs(fechaVuelo.getTime() - fechaBuscada.getTime());
          const diffDays = diff / (1000 * 60 * 60 * 24);

          return v.aeropuerto_Origen_Id === Number(this.origenId) &&
            v.aeropuerto_Destino_Id === Number(this.destinoId) &&
            diffDays <= 2 &&
            v.estado === 'Programado';
        });
      }

      // Cargar tramos de cada ruta
      const rutaIds = [...new Set(this.vuelosFiltrados.map(v => v.ruta_Id))];
      if (rutaIds.length > 0) {
        const requests = rutaIds.map(id =>
          this.rutaTramoService.getByRutaId(id).pipe(catchError(() => of([])))
        );
        forkJoin(requests).subscribe((results: any[]) => {
          rutaIds.forEach((id, i) => {
            this.tramosMap[id] = results[i];
          });
          this.cdr.markForCheck();
        });
      } else {
        this.cdr.markForCheck();
      }
    });
  }

  seleccionar(vuelo: VueloDisponible): void {
    this.router.navigate(['/dashboard/cliente/seleccionar-asiento', vuelo.id], {
      state: { vuelo }
    });
  }

  getDuracion(vuelo: VueloDisponible): string {
    if (!vuelo.hora_Salida || !vuelo.hora_Llegada) return '--';
    const [hS, mS] = vuelo.hora_Salida.split(':').map(Number);
    const [hL, mL] = vuelo.hora_Llegada.split(':').map(Number);
    const minutos = (hL * 60 + mL) - (hS * 60 + mS);
    const h = Math.floor(Math.abs(minutos) / 60);
    const m = Math.abs(minutos) % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  }
}