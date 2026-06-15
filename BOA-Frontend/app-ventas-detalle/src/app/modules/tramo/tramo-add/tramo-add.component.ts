import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TramoService } from '../service/tramo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { Tramo } from '../../../interfaces/tramo.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-tramo-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tramo-add.component.html',
  styleUrls: ['./tramo-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TramoAddComponent implements OnInit {
  tramo: Tramo = {
    tramo_Padre_Id: undefined,
    aeropuerto_Origen_Id: 0,
    aeropuerto_Destino_Id: 0,
    duracion_Estimada: '',
    tiempo_Escala: '',
    orden: 1
  };
  aeropuertos: Aeropuerto[] = [];
  tramos: Tramo[] = [];

  constructor(
    private tramoService: TramoService,
    private aeropuertoService: AeropuertoService,
    private router: Router,
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

  getNombreAeropuerto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.nombre} (${a.codigo_IATA})` : `ID: ${id}`;
  }

  save(): void {
    this.tramoService.create(this.tramo).subscribe(() => {
      this.router.navigate(['/dashboard/tramo/list']);
    });
  }
}