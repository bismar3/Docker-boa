import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProgramacionVueloService } from '../service/programacion-vuelo.service';
import { AeronaveService } from '../../aeronave/service/aeronave.service';
import { RutaService } from '../../ruta/service/ruta.service';
import { RutaTramoService, RutaTramo } from '../../ruta/service/ruta-tramo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { ProgramacionVuelo } from '../../../interfaces/programacion-vuelo.interface';
import { Aeronave } from '../../../interfaces/aeronave.interface';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

interface RutaTramoOpcion {
  rutaTramoId: number;
  rutaId: number;
  label: string;
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
    codigo_vuelo: '',
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
  rutaTramoOpciones: RutaTramoOpcion[] = [];
  rutaTramoSeleccionado: number = 0;

  constructor(
    private programacionService: ProgramacionVueloService,
    private aeronaveService: AeronaveService,
    private rutaService: RutaService,
    private rutaTramoService: RutaTramoService,
    private aeropuertoService: AeropuertoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.aeropuertoService.getAll().subscribe(ap => {
      this.aeropuertos = ap;
      this.aeronaveService.getAll().subscribe(an => {
        this.aeronaves = an;
        this.rutaService.getAll().subscribe(rutas => {
          this.rutas = rutas;
          this.cargarTodasRutaTramos(rutas);
        });
      });
    });
  }

  cargarTodasRutaTramos(rutas: Ruta[]): void {
    this.rutaTramoOpciones = [];
    let pendientes = rutas.length;
    if (pendientes === 0) return;

    rutas.forEach(ruta => {
      this.rutaTramoService.getByRutaId(ruta.id!).subscribe(rts => {
        rts.forEach(rt => {
          const origenRuta = this.aeropuertos.find(a => a.id === ruta.aeropuerto_Origen_Id);
          const destinoRuta = this.aeropuertos.find(a => a.id === ruta.aeropuerto_Destino_Id);
          const origenTramo = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Origen_Id);
          const destinoTramo = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Destino_Id);

          const subTramos = rt.tramo?.tramo_Padre_Id ? 0 :
            this.rutas.length; // placeholder

          const label = `${origenRuta?.codigo_IATA || '?'} → ${destinoRuta?.codigo_IATA || '?'} | Tramo ${rt.orden}: ${origenTramo?.codigo_IATA || '?'} → ${destinoTramo?.codigo_IATA || '?'}`;

          this.rutaTramoOpciones.push({
            rutaTramoId: rt.id!,
            rutaId: ruta.id!,
            label
          });
        });
        pendientes--;
      });
    });
  }

  onRutaTramoChange(): void {
    const opcion = this.rutaTramoOpciones.find(o => o.rutaTramoId === this.rutaTramoSeleccionado);
    if (opcion) {
      this.programacion.ruta_Tramo_Id = opcion.rutaTramoId;
      this.programacion.ruta_Id = opcion.rutaId;
    }
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