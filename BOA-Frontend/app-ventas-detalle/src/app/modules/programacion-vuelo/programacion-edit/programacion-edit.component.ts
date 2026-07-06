import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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

interface RutaOpcion {
  rutaId: number;
  rutaTramoId: number;
  label: string;
  origenId: number;
  destinoId: number;
}

@Component({
  selector: 'app-programacion-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './programacion-edit.component.html',
  styleUrls: ['./programacion-edit.component.css']
})
export class ProgramacionEditComponent implements OnInit {
  programacionId: number = 0;
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
  rutas: Ruta[] = [];
  aeropuertos: Aeropuerto[] = [];
  rutaOpciones: RutaOpcion[] = [];
  rutaSeleccionada: number = 0;
  calculandoLlegada: boolean = false;
  llegadaCalculada: boolean = false;
  private cargaInicialCompleta: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private programacionService: ProgramacionVueloService,
    private aeronaveService: AeronaveService,
    private rutaService: RutaService,
    private rutaTramoService: RutaTramoService,
    private aeropuertoService: AeropuertoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.programacionId = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      aeropuertos: this.aeropuertoService.getAll(),
      aeronaves: this.aeronaveService.getAll(),
      rutas: this.rutaService.getAll(),
      programacion: this.programacionService.getById(this.programacionId)
    }).subscribe(({ aeropuertos, aeronaves, rutas, programacion }) => {
      this.aeropuertos = aeropuertos;
      this.aeronaves = aeronaves;
      this.rutas = rutas;

      this.programacion = {
        ...programacion,
        fecha_Salida: this.soloFecha(programacion.fecha_Salida),
        hora_Salida: this.soloHora(programacion.hora_Salida),
        fecha_Llegada: this.soloFecha(programacion.fecha_Llegada),
        hora_Llegada: this.soloHora(programacion.hora_Llegada)
      };

      this.rutaSeleccionada = programacion.ruta_Id;
      this.cargarRutas(rutas);

      setTimeout(() => { this.cargaInicialCompleta = true; }, 0);
    });
  }

  private soloFecha(valor: string): string {
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
    return '';
  }

  private soloHora(valor: string): string {
    if (!valor) return '';
    return valor.substring(0, 5);
  }

  cargarRutas(rutas: Ruta[]): void {
    this.rutaOpciones = [];
    let pendientes = rutas.length;
    if (pendientes === 0) return;

    rutas.forEach(ruta => {
      this.rutaTramoService.getByRutaId(ruta.id!).subscribe(rts => {
        const origenRuta = this.aeropuertos.find(a => a.id === ruta.aeropuerto_Origen_Id);
        const destinoRuta = this.aeropuertos.find(a => a.id === ruta.aeropuerto_Destino_Id);

        const tramosDesc = rts
          .sort((a, b) => a.orden - b.orden)
          .map(rt => {
            const o = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Origen_Id);
            const d = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Destino_Id);
            return `${o?.codigo_IATA || '?'}→${d?.codigo_IATA || '?'}`;
          }).join(', ');

        const tipoRuta = ruta.tipo || '';
        const numTramos = rts.length;

        const label = `${origenRuta?.codigo_IATA || '?'} → ${destinoRuta?.codigo_IATA || '?'} (${origenRuta?.ciudad || '?'} → ${destinoRuta?.ciudad || '?'}) | ${numTramos} tramo(s): ${tramosDesc} — ${tipoRuta}`;

        const primerRutaTramo = rts.sort((a, b) => a.orden - b.orden)[0];

        this.rutaOpciones.push({
          rutaId: ruta.id!,
          rutaTramoId: primerRutaTramo?.id || 0,
          label,
          origenId: ruta.aeropuerto_Origen_Id,
          destinoId: ruta.aeropuerto_Destino_Id
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
    }
    this.intentarCalcularLlegada();
  }

  onFechaHoraSalidaChange(): void {
    this.intentarCalcularLlegada();
  }

  private intentarCalcularLlegada(): void {
    if (!this.cargaInicialCompleta) return;

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
    this.programacion.id = this.programacionId;
    this.programacionService.update(this.programacion).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/programacion-vuelo/list']);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Error al guardar. Revisá la consola para más detalles.');
      }
    });
  }
}