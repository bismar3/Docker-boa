import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProgramacionVueloService } from '../service/programacion-vuelo.service';
import { AeronaveService } from '../../aeronave/service/aeronave.service';
import { RutaService } from '../../ruta/service/ruta.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { ProgramacionVuelo } from '../../../interfaces/programacion-vuelo.interface';
import { Aeronave } from '../../../interfaces/aeronave.interface';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-programacion-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './programacion-list.component.html',
  styleUrls: ['./programacion-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramacionListComponent implements OnInit {
  programaciones: ProgramacionVuelo[] = [];
  aeronaves: Aeronave[] = [];
  rutas: Ruta[] = [];
  aeropuertos: Aeropuerto[] = [];

  constructor(
    private programacionService: ProgramacionVueloService,
    private aeronaveService: AeronaveService,
    private rutaService: RutaService,
    private aeropuertoService: AeropuertoService,
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
      this.programaciones = programaciones;
      this.cdr.markForCheck();
    });
  }

  load(): void {
    this.programacionService.getAll().subscribe(data => {
      this.programaciones = data;
      this.cdr.markForCheck();
    });
  }

  getNombreAeronave(id: number): string {
    const a = this.aeronaves.find(a => a.id === id);
    return a ? `${a.matricula}` : `ID: ${id}`;
  }

  private getRutaObj(rutaId: number): Ruta | undefined {
    return this.rutas.find(r => r.id === rutaId);
  }

  getCiudadOrigen(rutaId: number): string {
    const r = this.getRutaObj(rutaId);
    if (!r) return '?';
    return this.aeropuertos.find(a => a.id === r.aeropuerto_Origen_Id)?.ciudad || '?';
  }

  getCiudadDestino(rutaId: number): string {
    const r = this.getRutaObj(rutaId);
    if (!r) return '?';
    return this.aeropuertos.find(a => a.id === r.aeropuerto_Destino_Id)?.ciudad || '?';
  }

  getCodigoOrigen(rutaId: number): string {
    const r = this.getRutaObj(rutaId);
    if (!r) return '?';
    return this.aeropuertos.find(a => a.id === r.aeropuerto_Origen_Id)?.codigo_IATA || '?';
  }

  getCodigoDestino(rutaId: number): string {
    const r = this.getRutaObj(rutaId);
    if (!r) return '?';
    return this.aeropuertos.find(a => a.id === r.aeropuerto_Destino_Id)?.codigo_IATA || '?';
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Programado': return 'bg-blue-600';
      case 'Reprogramado': return 'bg-yellow-600';
      case 'Salido': return 'bg-green-600';
      case 'Completo': return 'bg-gray-600';
      case 'PendienteReprogramacion': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  }

  delete(id: number): void {
    if (confirm('¿Eliminar esta programación?')) {
      this.programacionService.delete(id).subscribe(() => this.load());
    }
  }

  regenerarAsientos(id: number): void {
    this.programacionService.regenerarAsientos(id).subscribe({
      next: (res: any) => {
        alert(res?.message || 'Asientos regenerados correctamente.');
      },
      error: (err) => {
        console.error('Error al regenerar asientos:', err);
        alert('Error al regenerar asientos.');
      }
    });
  }
}