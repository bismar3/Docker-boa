import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BuscarVueloService, VueloDisponible } from '../service/buscar-vuelo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { RutaTramoService } from '../../ruta/service/ruta-tramo.service';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

interface TramoInfo {
  esRaiz: boolean;
  origen: string;
  destino: string;
  duracion: string;
}

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

  origenId: number | null = null;
  destinoId: number | null = null;

  fecha: string = '';
  buscado: boolean = false;
  hoy: string = new Date().toISOString().split('T')[0];

  // --- Ver escalas ---
  escalasExpandidas = new Set<number>();
  escalasCache: { [programacionId: number]: TramoInfo[] } = {};
  cargandoEscalas = new Set<number>();

  constructor(
    private buscarVueloService: BuscarVueloService,
    private aeropuertoService: AeropuertoService,
    private rutaTramoService: RutaTramoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.aeropuertoService.getAll().subscribe(data => {
      this.aeropuertos = data.sort((a, b) => a.ciudad.localeCompare(b.ciudad));
      this.cdr.markForCheck();
    });
  }

  getCodigoIATA(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? a.codigo_IATA : '?';
  }

  getCiudad(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? a.ciudad : '';
  }

  buscar(): void {
    if (!this.origenId || !this.destinoId) {
      alert('Selecciona origen y destino.');
      return;
    }
    if (!this.fecha) return;
    if (this.origenId === this.destinoId) {
      alert('El origen y destino no pueden ser el mismo.');
      return;
    }

    this.escalasExpandidas.clear();
    this.escalasCache = {};

    this.buscarVueloService.buscarPorTramo(
      this.origenId,
      this.destinoId
    ).subscribe(data => {
      this.buscado = true;

      this.vuelosFiltrados = data.filter(v => {
        const partes = v.fecha_Salida.split(' ')[0].split('/');
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const anio = partes[2];
        const fechaVueloStr = `${anio}-${mes}-${dia}`;
        return fechaVueloStr === this.fecha;
      });

      if (this.vuelosFiltrados.length === 0) {
        this.vuelosFiltrados = data.filter(v => {
          const partes = v.fecha_Salida.split(' ')[0].split('/');
          const dia = partes[0].padStart(2, '0');
          const mes = partes[1].padStart(2, '0');
          const anio = partes[2];
          const fechaVueloStr = `${anio}-${mes}-${dia}`;
          const diff = Math.abs(new Date(fechaVueloStr).getTime() - new Date(this.fecha).getTime());
          return diff / (1000 * 60 * 60 * 24) <= 2;
        });
      }

      this.cdr.markForCheck();
    });
  }

  seleccionar(vuelo: VueloDisponible): void {
    this.router.navigate(['/dashboard/cliente/seleccionar-asiento', vuelo.programacionId], {
      state: { vuelo }
    });
  }

  getDuracion(vuelo: VueloDisponible): string {
    if (vuelo.es_Tramo_Parcial && vuelo.duracion_Estimada) {
      return vuelo.duracion_Estimada;
    }
    if (!vuelo.hora_Salida || !vuelo.hora_Llegada) return '--';
    const [hS, mS] = vuelo.hora_Salida.split(':').map(Number);
    const [hL, mL] = vuelo.hora_Llegada.split(':').map(Number);
    const minutos = (hL * 60 + mL) - (hS * 60 + mS);
    const h = Math.floor(Math.abs(minutos) / 60);
    const m = Math.abs(minutos) % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // --- Ver escalas ---

  estaExpandido(vuelo: VueloDisponible): boolean {
    return this.escalasExpandidas.has(vuelo.programacionId);
  }

  estaCargandoEscalas(vuelo: VueloDisponible): boolean {
    return this.cargandoEscalas.has(vuelo.programacionId);
  }

  getEscalasDe(vuelo: VueloDisponible): TramoInfo[] {
    return this.escalasCache[vuelo.programacionId] || [];
  }

  toggleVerEscalas(vuelo: VueloDisponible): void {
    const id = vuelo.programacionId;

    if (this.escalasExpandidas.has(id)) {
      this.escalasExpandidas.delete(id);
      this.cdr.markForCheck();
      return;
    }

    this.escalasExpandidas.add(id);

    if (this.escalasCache[id]) {
      this.cdr.markForCheck();
      return;
    }

    this.cargandoEscalas.add(id);
    this.cdr.markForCheck();

    this.rutaTramoService.getByRutaId(vuelo.ruta_Id).subscribe(rts => {
      const rtsOrdenados = rts.sort((a, b) => a.orden - b.orden);

      const tramosInfo: TramoInfo[] = rtsOrdenados.map(rt => {
        const o = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Origen_Id);
        const d = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Destino_Id);
        return {
          esRaiz: !rt.tramo?.tramo_Padre_Id,
          origen: o ? `${o.ciudad} (${o.codigo_IATA})` : '?',
          destino: d ? `${d.ciudad} (${d.codigo_IATA})` : '?',
          duracion: rt.tramo?.duracion_Estimada || '--'
        };
      });

      this.escalasCache[id] = tramosInfo;
      this.cargandoEscalas.delete(id);
      this.cdr.markForCheck();
    });
  }
}