import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RutaService } from '../service/ruta.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-ruta-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ruta-edit.component.html',
  styleUrls: ['./ruta-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RutaEditComponent implements OnInit {
  ruta: Ruta = {
    aeropuerto_Origen_Id: 0,
    aeropuerto_Destino_Id: 0,
    distancia: 0,
    duracion_Estimada: '',
    tipo: 'Nacional'
  };
  aeropuertos: Aeropuerto[] = [];

  constructor(
    private rutaService: RutaService,
    private aeropuertoService: AeropuertoService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      aeropuertos: this.aeropuertoService.getAll(),
      ruta: this.rutaService.getById(id)
    }).subscribe(({ aeropuertos, ruta }) => {
      this.aeropuertos = aeropuertos;
      this.ruta = ruta;
      this.cdr.markForCheck();
    });
  }

  save(): void {
    this.rutaService.update(this.ruta).subscribe(() => {
      this.router.navigate(['/dashboard/ruta/list']);
    });
  }
}