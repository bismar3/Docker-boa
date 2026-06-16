import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BuscarVueloService, VueloDisponible } from '../service/buscar-vuelo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
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

  origenId: number = 0;
  destinoId: number = 0;
  fecha: string = '';
  buscado: boolean = false;
  hoy: string = new Date().toISOString().split('T')[0];

  constructor(
    private buscarVueloService: BuscarVueloService,
    private aeropuertoService: AeropuertoService,
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

  buscar(): void {
    if (!this.origenId || !this.destinoId || !this.fecha) return;
    if (this.origenId === this.destinoId) return;

    this.buscarVueloService.buscarPorTramo(
      Number(this.origenId),
      Number(this.destinoId)
    ).subscribe(data => {
      this.buscado = true;

      // Filtrar por fecha
      this.vuelosFiltrados = data.filter(v => {
        const partes = v.fecha_Salida.split(' ')[0].split('/');
        const dia = partes[0].padStart(2, '0');
        const mes = partes[1].padStart(2, '0');
        const anio = partes[2];
        const fechaVueloStr = `${anio}-${mes}-${dia}`;
        return fechaVueloStr === this.fecha;
      });

      // Si no hay exacta buscar ±2 días
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
}