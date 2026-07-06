import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TripulacionService, Tripulacion } from '../service/tripulacion.service';
import { ProgramacionVueloService } from '../../programacion-vuelo/service/programacion-vuelo.service';
import { EmpleadoService } from '../../empleado/service/empleado.service';
import { AeronaveService } from '../../aeronave/service/aeronave.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';

@Component({
  selector: 'app-tripulacion-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tripulacion-gestion.component.html',
  styleUrl: './tripulacion-gestion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripulacionGestionComponent implements OnInit {
  programaciones: any[] = [];
  aeronaves: any[] = [];
  aeropuertos: any[] = [];
  empleados: any[] = [];

  programacionSeleccionada: number = 0;
  vueloActual: any = null;
  tripulacionActual: Tripulacion[] = [];

  mostrarSelector: boolean = false;
  cargoSeleccionado: string = '';
  empleadoSeleccionado: number = 0;

  cargando: boolean = true;

  constructor(
    private tripulacionService: TripulacionService,
    private programacionService: ProgramacionVueloService,
    private empleadoService: EmpleadoService,
    private aeronaveService: AeronaveService,
    private aeropuertoService: AeropuertoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      programaciones: this.programacionService.getAll(),
      aeronaves: this.aeronaveService.getAll(),
      aeropuertos: this.aeropuertoService.getAll(),
      empleados: this.empleadoService.getAll()
    }).subscribe(({ programaciones, aeronaves, aeropuertos, empleados }) => {
      this.programaciones = programaciones;
      this.aeronaves = aeronaves;
      this.aeropuertos = aeropuertos;
      this.empleados = empleados;
      this.cargando = false;
      this.cdr.markForCheck();
    });
  }

  getLabelVuelo(p: any): string {
    const origen = this.aeropuertos.find(a => a.id === p.aeropuerto_Origen_Id);
    const destino = this.aeropuertos.find(a => a.id === p.aeropuerto_Destino_Id);
    return `${p.codigo_Vuelo} | ${origen?.codigo_IATA || '?'} → ${destino?.codigo_IATA || '?'} | ${p.fecha_Salida} ${p.hora_Salida}`;
  }

  verTripulacion(): void {
    if (!this.programacionSeleccionada) return;

    this.vueloActual = this.programaciones.find(p => p.id === Number(this.programacionSeleccionada));
    this.loadTripulacion();
  }

  loadTripulacion(): void {
    this.tripulacionService.getByProgramacion(this.programacionSeleccionada).subscribe({
      next: (data) => {
        this.tripulacionActual = data;
        this.cdr.markForCheck();
      }
    });
  }

  getNombreAeronave(id: number): string {
    const a = this.aeronaves.find(a => a.id === id);
    return a ? `${a.matricula} - ${a.modelo}` : `ID: ${id}`;
  }

  get totalPilotos(): number {
    return this.tripulacionActual.filter(t => t.cargo === 'Piloto').length;
  }

  get totalCopilotos(): number {
    return this.tripulacionActual.filter(t => t.cargo === 'Copiloto').length;
  }

  get totalAuxiliares(): number {
    return this.tripulacionActual.filter(t => t.cargo === 'Auxiliar').length;
  }

  abrirAsignar(cargo: string): void {
    this.cargoSeleccionado = cargo;
    this.empleadoSeleccionado = 0;
    this.mostrarSelector = true;
    this.cdr.markForCheck();
  }

  cerrarAsignar(): void {
    this.mostrarSelector = false;
    this.cdr.markForCheck();
  }

  asignar(): void {
    if (!this.empleadoSeleccionado) return;

    const nuevaTripulacion: Tripulacion = {
      programacion_Vuelo_Id: this.vueloActual.id,
      empleado_Id: Number(this.empleadoSeleccionado),
      cargo: this.cargoSeleccionado
    };

    this.tripulacionService.create(nuevaTripulacion).subscribe({
      next: () => {
        this.cerrarAsignar();
        this.loadTripulacion();
      },
      error: () => alert('Error al asignar tripulación')
    });
  }

  remover(t: Tripulacion): void {
    if (!confirm('¿Remover este miembro de la tripulación?')) return;

    this.tripulacionService.delete(t.id!).subscribe({
      next: () => this.loadTripulacion(),
      error: () => alert('Error al remover')
    });
  }

  getCargoClass(cargo: string): string {
    switch (cargo) {
      case 'Piloto': return 'bg-blue-600';
      case 'Copiloto': return 'bg-cyan-500';
      case 'Auxiliar': return 'bg-gray-500';
      default: return 'bg-gray-600';
    }
  }
}