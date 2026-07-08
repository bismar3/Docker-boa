import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RutaService } from '../service/ruta.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-ruta-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ruta-list.component.html',
  styleUrls: ['./ruta-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RutaListComponent implements OnInit {
  rutas: Ruta[] = [];
  aeropuertos: Aeropuerto[] = [];

  constructor(
    private rutaService: RutaService,
    private aeropuertoService: AeropuertoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      aeropuertos: this.aeropuertoService.getAll(),
      rutas: this.rutaService.getAll()
    }).subscribe(({ aeropuertos, rutas }) => {
      this.aeropuertos = aeropuertos;
      this.rutas = rutas;
      this.cdr.markForCheck();
    });
  }

  load(): void {
    this.rutaService.getAll().subscribe(data => {
      this.rutas = data;
      this.cdr.markForCheck();
    });
  }

  getCiudad(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? a.ciudad : `ID: ${id}`;
  }

  getCodigoIATA(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? a.codigo_IATA : '?';
  }

  getNombreCompleto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? a.nombre : '';
  }

  delete(id: number): void {
    if (confirm('¿Eliminar esta ruta?')) {
      this.rutaService.delete(id).subscribe(() => this.load());
    }
  }
}