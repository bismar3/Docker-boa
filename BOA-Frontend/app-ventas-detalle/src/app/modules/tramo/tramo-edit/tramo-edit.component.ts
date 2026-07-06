import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TramoService } from '../service/tramo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { Tramo } from '../../../interfaces/tramo.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-tramo-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tramo-edit.component.html',
  styleUrls: ['./tramo-edit.component.css']
})
export class TramoEditComponent implements OnInit {
  tramoId: number = 0;
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
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private tramoService: TramoService,
    private aeropuertoService: AeropuertoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tramoId = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      aeropuertos: this.aeropuertoService.getAll(),
      tramos: this.tramoService.getAll(),
      tramo: this.tramoService.getById(this.tramoId)
    }).subscribe(({ aeropuertos, tramos, tramo }) => {
      this.aeropuertos = aeropuertos;
      // Excluir el propio tramo de la lista de posibles "padres" (evita auto-referencia)
      this.tramos = tramos.filter(t => t.id !== this.tramoId);
      this.tramo = tramo;
      this.cargando = false;
      this.cdr.markForCheck();
    });
  }

  getNombreAeropuerto(id: number): string {
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.nombre} (${a.codigo_IATA})` : `ID: ${id}`;
  }

  save(): void {
    this.tramo.id = this.tramoId;
    this.tramoService.update(this.tramo).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tramo/list']);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Error al guardar los cambios. Revisá la consola.');
      }
    });
  }
}