import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProgramacionVueloService } from '../../programacion-vuelo/service/programacion-vuelo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';

@Component({
  selector: 'app-consultar-vuelo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultar-vuelo-list.component.html',
  styleUrl: './consultar-vuelo-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultarVueloListComponent implements OnInit {
  programaciones: any[] = [];
  programacionesFiltradas: any[] = [];
  aeropuertos: any[] = [];
  cargando: boolean = true;
  filtroTexto: string = '';

  constructor(
    private programacionService: ProgramacionVueloService,
    private aeropuertoService: AeropuertoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      programaciones: this.programacionService.getAll(),
      aeropuertos: this.aeropuertoService.getAll()
    }).subscribe(({ programaciones, aeropuertos }: any) => {
      this.programaciones = programaciones;
      this.aeropuertos = aeropuertos;
      this.programacionesFiltradas = programaciones;
      this.cargando = false;
      this.cdr.markForCheck();
    });
  }

  getCodigoIATA(id: number): string {
    const a = this.aeropuertos.find((a: any) => a.id === id);
    return a ? a.codigo_IATA : '?';
  }

  filtrar(): void {
    const texto = this.filtroTexto.toLowerCase();
    this.programacionesFiltradas = this.programaciones.filter((p: any) =>
      !texto || p.codigo_Vuelo.toLowerCase().includes(texto)
    );
    this.cdr.markForCheck();
  }

  limpiar(): void {
    this.filtroTexto = '';
    this.programacionesFiltradas = this.programaciones;
    this.cdr.markForCheck();
  }

  verDetalle(p: any): void {
    this.router.navigate(['/dashboard/consultar-vuelo/detalle', p.id], { state: { vuelo: p } });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Programado': return 'bg-blue-600';
      case 'Salido': return 'bg-gray-600';
      case 'Completo': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  }
}