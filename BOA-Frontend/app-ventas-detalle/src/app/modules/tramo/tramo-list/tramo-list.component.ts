import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TramoService } from '../service/tramo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { Tramo } from '../../../interfaces/tramo.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-tramo-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tramo-list.component.html',
  styleUrls: ['./tramo-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TramoListComponent implements OnInit {
  tramos: Tramo[] = [];
  aeropuertos: Aeropuerto[] = [];

  constructor(
    private tramoService: TramoService,
    private aeropuertoService: AeropuertoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      aeropuertos: this.aeropuertoService.getAll(),
      tramos: this.tramoService.getAll()
    }).subscribe(({ aeropuertos, tramos }) => {
      this.aeropuertos = aeropuertos;
      this.tramos = tramos;
      this.cdr.markForCheck();
    });
  }

  load(): void {
    this.tramoService.getAll().subscribe(data => {
      this.tramos = data;
      this.cdr.markForCheck();
    });
  }

  getNombreAeropuerto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.nombre} (${a.codigo_IATA})` : `ID: ${id}`;
  }

  esPadre(t: Tramo): boolean {
    return !t.tramo_Padre_Id;
  }

  getSubTramos(id: number): Tramo[] {
    return this.tramos.filter(t => t.tramo_Padre_Id === id);
  }

  delete(id: number): void {
    if (confirm('¿Eliminar este tramo?')) {
      this.tramoService.delete(id).subscribe(() => this.load());
    }
  }
}