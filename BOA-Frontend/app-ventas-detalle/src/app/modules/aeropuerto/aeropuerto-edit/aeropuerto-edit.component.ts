import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AeropuertoService, AeropuertoSugerencia } from '../service/aeropuerto.service';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-aeropuerto-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './aeropuerto-edit.component.html',
  styleUrls: ['./aeropuerto-edit.component.css']
})
export class AeropuertoEditComponent implements OnInit {
  aeropuertoId: number = 0;
  aeropuerto: Aeropuerto = {
    codigo_IATA: '',
    nombre: '',
    ciudad: '',
    pais: '',
    latitud: undefined,
    longitud: undefined
  };

  textoBusqueda: string = '';
  sugerencias: AeropuertoSugerencia[] = [];
  buscando: boolean = false;
  seleccionRealizada: boolean = false;
  cargando: boolean = true;
  private debounceTimer: any;

  constructor(
    private route: ActivatedRoute,
    private aeropuertoService: AeropuertoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.aeropuertoId = Number(this.route.snapshot.paramMap.get('id'));
    this.aeropuertoService.getById(this.aeropuertoId).subscribe(data => {
      this.aeropuerto = data;
      this.cargando = false;
      this.cdr.markForCheck();
    });
  }

  onBuscarInput(): void {
    this.seleccionRealizada = false;
    clearTimeout(this.debounceTimer);

    if (this.textoBusqueda.trim().length < 3) {
      this.sugerencias = [];
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.buscando = true;
      this.cdr.markForCheck();

      this.aeropuertoService.buscarAeropuertos(this.textoBusqueda).subscribe(data => {
        this.sugerencias = data;
        this.buscando = false;
        this.cdr.markForCheck();
      });
    }, 500);
  }

  seleccionarSugerencia(s: AeropuertoSugerencia): void {
    this.aeropuerto.nombre = s.nombre;
    this.aeropuerto.ciudad = s.ciudad;
    this.aeropuerto.pais = s.pais;
    this.aeropuerto.latitud = s.latitud;
    this.aeropuerto.longitud = s.longitud;

    this.textoBusqueda = `${s.nombre} — ${s.ciudad}, ${s.pais}`;
    this.sugerencias = [];
    this.seleccionRealizada = true;
    this.cdr.markForCheck();
  }

  save(): void {
    this.aeropuerto.id = this.aeropuertoId;
    this.aeropuertoService.update(this.aeropuertoId, this.aeropuerto).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/aeropuerto/list']);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('Error al guardar los cambios. Revisá la consola.');
      }
    });
  }
}