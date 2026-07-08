import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProgramacionVueloService } from '../service/programacion-vuelo.service';
import { AeronaveService } from '../../aeronave/service/aeronave.service';
import { RutaService } from '../../ruta/service/ruta.service';
import { RutaTramoService } from '../../ruta/service/ruta-tramo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { ProgramacionVuelo } from '../../../interfaces/programacion-vuelo.interface';
import { Aeronave } from '../../../interfaces/aeronave.interface';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

interface TramoInfo {
  esRaiz: boolean;
  origen: string;
  destino: string;
  duracion: string;
}

interface RutaOpcion {
  rutaId: number;
  rutaTramoId: number;
  label: string;
  origenId: number;
  destinoId: number;
  tramos: TramoInfo[];
}

@Component({
  selector: 'app-programacion-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './programacion-add.component.html',
  styleUrls: ['./programacion-add.component.css']
})
export class ProgramacionAddComponent implements OnInit {
  programacion: ProgramacionVuelo = {
    codigo_Vuelo: '',
    aeronave_Id: 0,
    ruta_Id: 0,
    ruta_Tramo_Id: 0,
    fecha_Salida: '',
    hora_Salida: '',
    fecha_Llegada: '',
    hora_Llegada: '',
    precio_Base: 0,
    estado: 'Programado'
  };

  aeronaves: Aeronave[] = [];
  aeronavesDisponibles: Aeronave[] = [];
  todasLasProgramaciones: ProgramacionVuelo[] = [];
  rutas: Ruta[] = [];
  aeropuertos: Aeropuerto[] = [];
  rutaOpciones: RutaOpcion[] = [];
  rutaSeleccionada: number = 0;
  tramosDeRutaSeleccionada: TramoInfo[] = [];
  calculandoLlegada: boolean = false;
  llegadaCalculada: boolean = false;

  constructor(
    private programacionService: ProgramacionVueloService,
    private aeronaveService: AeronaveService,
    private rutaService: RutaService,
    private rutaTramoService: RutaTramoService,
    private aeropuertoService: AeropuertoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      aeropuertos: this.aeropuertoService.getAll(),
      aeronaves: this.aeronaveService.getAll(),
      rutas: this.rutaService.getAll(),
      programaciones: this.programacionService.getAll()
    }).subscribe(({ aeropuertos, aeronaves, rutas, programaciones }) => {
      this.aeropuertos = aeropuertos;
      this.aeronaves = aeronaves;
      this.rutas = rutas;
      this.todasLasProgramaciones = programaciones;
      this.calcularAeronavesDisponibles();
      this.cargarRutas(rutas);
    });
  }

  private calcularAeronavesDisponibles(): void {
    const ahora = new Date();
    const estadosOcupando = ['Programado', 'Reprogramado'];
    const aeronavesOcupadasIds = new Set<number>();

    this.todasLasProgramaciones.forEach(p => {
      if (!estadosOcupando.includes(p.estado)) return;

      const fechaLlegadaStr = this.normalizarFecha(p.fecha_Llegada);
      const horaLlegadaStr = (p.hora_Llegada || '00:00').substring(0, 5);
      const fechaLlegadaCompleta = new Date(`${fechaLlegadaStr}T${horaLlegadaStr}:00`);

      if (!isNaN(fechaLlegadaCompleta.getTime()) && fechaLlegadaCompleta > ahora) {
        aeronavesOcupadasIds.add(p.aeronave_Id);
      }
    });

    this.aeronavesDisponibles = this.aeronaves.filter(a => !aeronavesOcupadasIds.has(a.id!));
    this.cdr.markForCheck();
  }

  private normalizarFecha(valor: string): string {
    if (!valor) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      return valor.substring(0, 10);
    }
    const soloFechaParte = valor.split(' ')[0];
    const partes = soloFechaParte.split('/');
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return valor;
  }

  cargarRutas(rutas: Ruta[]): void {
    this.rutaOpciones = [];
    let pendientes = rutas.length;
    if (pendientes === 0) return;

    rutas.forEach(ruta => {
      this.rutaTramoService.getByRutaId(ruta.id!).subscribe(rts => {
        const origenRuta = this.aeropuertos.find(a => a.id === ruta.aeropuerto_Origen_Id);
        const destinoRuta = this.aeropuertos.find(a => a.id === ruta.aeropuerto_Destino_Id);

        const rtsOrdenados = rts.sort((a, b) => a.orden - b.orden);

        const tramosDesc = rtsOrdenados
          .map(rt => {
            const o = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Origen_Id);
            const d = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Destino_Id);
            return `${o?.codigo_IATA || '?'}→${d?.codigo_IATA || '?'}`;
          }).join(', ');

        const tipoRuta = ruta.tipo || '';
        const numTramos = rtsOrdenados.length;

        const label = `${origenRuta?.codigo_IATA || '?'} → ${destinoRuta?.codigo_IATA || '?'} (${origenRuta?.ciudad || '?'} → ${destinoRuta?.ciudad || '?'}) | ${numTramos} tramo(s): ${tramosDesc} — ${tipoRuta}`;

        const primerRutaTramo = rtsOrdenados[0];

        // Armamos el detalle de tramos: el primero (orden 1, sin padre) es el Tramo Raíz.
        // Los demás son escalas/sub-tramos.
        const tramosInfo: TramoInfo[] = rtsOrdenados.map((rt, index) => {
          const o = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Origen_Id);
          const d = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Destino_Id);
          return {
            esRaiz: !rt.tramo?.tramo_Padre_Id,
            origen: o ? `${o.ciudad} (${o.codigo_IATA})` : '?',
            destino: d ? `${d.ciudad} (${d.codigo_IATA})` : '?',
            duracion: rt.tramo?.duracion_Estimada || '--'
          };
        });

        this.rutaOpciones.push({
          rutaId: ruta.id!,
          rutaTramoId: primerRutaTramo?.id || 0,
          label,
          origenId: ruta.aeropuerto_Origen_Id,
          destinoId: ruta.aeropuerto_Destino_Id,
          tramos: tramosInfo
        });

        pendientes--;
        if (pendientes === 0) this.cdr.markForCheck();
      });
    });
  }

  onRutaChange(): void {
    const opcion = this.rutaOpciones.find(o => o.rutaId === Number(this.rutaSeleccionada));
    if (opcion) {
      this.programacion.ruta_Id = opcion.rutaId;
      this.programacion.ruta_Tramo_Id = opcion.rutaTramoId;
      this.programacion.aeropuerto_Origen_Id = opcion.origenId;
      this.programacion.aeropuerto_Destino_Id = opcion.destinoId;
      this.tramosDeRutaSeleccionada = opcion.tramos;
    } else {
      this.tramosDeRutaSeleccionada = [];
    }
    this.intentarCalcularLlegada();
  }

  onFechaHoraSalidaChange(): void {
    this.intentarCalcularLlegada();
  }

  private intentarCalcularLlegada(): void {
    this.llegadaCalculada = false;

    if (!this.programacion.ruta_Id || !this.programacion.fecha_Salida || !this.programacion.hora_Salida) {
      return;
    }

    this.calculandoLlegada = true;
    this.cdr.markForCheck();

    this.rutaService.calcularLlegada(
      this.programacion.ruta_Id,
      this.programacion.fecha_Salida,
      this.programacion.hora_Salida
    ).subscribe(resultado => {
      this.calculandoLlegada = false;

      if (resultado) {
        this.programacion.fecha_Llegada = resultado.fechaLlegada;
        this.programacion.hora_Llegada = resultado.horaLlegada;
        this.llegadaCalculada = true;
      }

      this.cdr.markForCheck();
    });
  }

  getNombreAeropuerto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.nombre} (${a.codigo_IATA})` : `ID: ${id}`;
  }

  save(): void {
    this.programacionService.create(this.programacion).subscribe(() => {
      this.router.navigate(['/dashboard/programacion-vuelo/list']);
    });
  }
}