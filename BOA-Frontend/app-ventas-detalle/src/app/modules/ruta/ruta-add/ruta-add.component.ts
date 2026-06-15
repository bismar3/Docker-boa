import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RutaService } from '../service/ruta.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-ruta-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ruta-add.component.html',
  styleUrls: ['./ruta-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RutaAddComponent implements OnInit {
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.aeropuertoService.getAll().subscribe(data => {
      this.aeropuertos = data;
      this.cdr.markForCheck();
    });
  }

  save(): void {
    this.rutaService.create(this.ruta).subscribe(() => {
      this.router.navigate(['/dashboard/ruta/list']);
    });
  }
}