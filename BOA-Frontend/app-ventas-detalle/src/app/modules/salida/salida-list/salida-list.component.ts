import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SalidaService, Salida } from '../service/salida.service';
import { ProgramacionVueloService } from '../../programacion-vuelo/service/programacion-vuelo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';

@Component({
  selector: 'app-salida-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salida-list.component.html',
  styleUrl: './salida-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalidaListComponent implements OnInit {
  salidas: Salida[] = [];
  salidasFiltradas: any[] = [];
  programaciones: any[] = [];
  aeropuertos: any[] = [];

  programacionesDisponibles: any[] = [];
  programacionSeleccionada: number = 0;

  cargando: boolean = true;
  filtroTexto: string = '';

  constructor(
    private salidaService: SalidaService,
    private programacionService: ProgramacionVueloService,
    private aeropuertoService: AeropuertoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({
      salidas: this.salidaService.getAll(),
      programaciones: this.programacionService.getAll(),
      aeropuertos: this.aeropuertoService.getAll()
    }).subscribe(({ salidas, programaciones, aeropuertos }: any) => {
      this.salidas = salidas;
      this.programaciones = programaciones;
      this.aeropuertos = aeropuertos;

      const idsConSalida = salidas.map((s: any) => s.programacion_Vuelo_Id);
      this.programacionesDisponibles = programaciones.filter(
        (p: any) => !idsConSalida.includes(p.id) && p.estado !== 'Salido'
      );

      this.salidasFiltradas = this.armarDetalle();
      this.cargando = false;
      this.cdr.markForCheck();
    });
  }

  armarDetalle(): any[] {
    return this.salidas.map((s: any) => {
      const prog = this.programaciones.find((p: any) => p.id === s.programacion_Vuelo_Id);
      const origen = this.aeropuertos.find((a: any) => a.id === prog?.aeropuerto_Origen_Id);
      const destino = this.aeropuertos.find((a: any) => a.id === prog?.aeropuerto_Destino_Id);

      return {
        ...s,
        codigo_Vuelo: prog?.codigo_Vuelo || '?',
        origen: origen?.codigo_IATA || '?',
        destino: destino?.codigo_IATA || '?',
        fecha_Salida: prog?.fecha_Salida || '-',
        hora_Salida: prog?.hora_Salida || '-'
      };
    }).sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0));
  }

  getLabelVuelo(p: any): string {
    const origen = this.aeropuertos.find((a: any) => a.id === p.aeropuerto_Origen_Id);
    const destino = this.aeropuertos.find((a: any) => a.id === p.aeropuerto_Destino_Id);
    return `${p.codigo_Vuelo} | ${origen?.codigo_IATA || '?'} → ${destino?.codigo_IATA || '?'} | ${p.fecha_Salida} ${p.hora_Salida}`;
  }

  registrarSalida(): void {
    if (!this.programacionSeleccionada) return;

    this.salidaService.registrar(this.programacionSeleccionada).subscribe({
      next: () => {
        this.programacionSeleccionada = 0;
        this.load();
      },
      error: () => alert('Error al registrar la salida')
    });
  }

  filtrar(): void {
    const texto = this.filtroTexto.toLowerCase();
    const detalle = this.armarDetalle();
    this.salidasFiltradas = detalle.filter((s: any) =>
      !texto || s.codigo_Vuelo.toLowerCase().includes(texto)
    );
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.filtroTexto = '';
    this.salidasFiltradas = this.armarDetalle();
    this.cdr.markForCheck();
  }
}