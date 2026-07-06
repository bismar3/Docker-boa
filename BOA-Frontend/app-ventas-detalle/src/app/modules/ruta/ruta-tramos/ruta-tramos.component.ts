import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RutaService } from '../service/ruta.service';
import { TramoService } from '../../tramo/service/tramo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { RutaTramoService, RutaTramo } from '../service/ruta-tramo.service';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Tramo } from '../../../interfaces/tramo.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-ruta-tramos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ruta-tramos.component.html',
  styleUrls: ['./ruta-tramos.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RutaTramosComponent implements OnInit {
  ruta!: Ruta;
  rutaTramos: RutaTramo[] = [];
  tramosDisponibles: Tramo[] = [];
  todosLosTramos: Tramo[] = [];
  aeropuertos: Aeropuerto[] = [];
  rutaId!: number;

  nuevoTramo: RutaTramo = {
    ruta_Id: 0,
    tramo_Id: 0,
    orden: 1
  };

  constructor(
    private rutaService: RutaService,
    private tramoService: TramoService,
    private aeropuertoService: AeropuertoService,
    private rutaTramoService: RutaTramoService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.rutaId = Number(this.route.snapshot.paramMap.get('id'));
    this.nuevoTramo.ruta_Id = this.rutaId;

    forkJoin({
      aeropuertos: this.aeropuertoService.getAll(),
      ruta: this.rutaService.getById(this.rutaId),
      tramos: this.tramoService.getAll(),
      rutaTramos: this.rutaTramoService.getByRutaId(this.rutaId)
    }).subscribe(({ aeropuertos, ruta, tramos, rutaTramos }) => {
      this.aeropuertos = aeropuertos;
      this.todosLosTramos = tramos;
      this.tramosDisponibles = tramos.filter(t => !t.tramo_Padre_Id);
      this.rutaTramos = rutaTramos;
      this.nuevoTramo.orden = rutaTramos.length + 1;
      this.cdr.markForCheck();
    });
  }

  loadRutaTramos(): void {
    this.rutaTramoService.getByRutaId(this.rutaId).subscribe(data => {
      this.rutaTramos = data;
      this.nuevoTramo.orden = this.rutaTramos.length + 1;
      this.cdr.markForCheck();
    });
  }

  getNombreAeropuerto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.codigo_IATA}` : `ID: ${id}`;
  }

  getNombreAeropuertoCompleto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.nombre} (${a.codigo_IATA})` : `ID: ${id}`;
  }

  getSubTramos(id: number): Tramo[] {
    return this.todosLosTramos.filter(t => t.tramo_Padre_Id === id);
  }

  agregarTramo(): void {
    if (this.nuevoTramo.tramo_Id === 0) return;
    this.rutaTramoService.add(this.nuevoTramo).subscribe(() => {
      this.loadRutaTramos();
      this.nuevoTramo.tramo_Id = 0;
    });
  }

  quitarTramo(id: number): void {
    if (confirm('¿Quitar este tramo de la ruta?')) {
      this.rutaTramoService.delete(id).subscribe(() => {
        this.loadRutaTramos();
      });
    }
  }
}