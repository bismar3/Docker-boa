import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AeropuertoService, AeropuertoSugerencia } from '../service/aeropuerto.service';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-aeropuerto-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './aeropuerto-add.component.html',
  styleUrls: ['./aeropuerto-add.component.css']
})
export class AeropuertoAddComponent {
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
  private debounceTimer: any;

  constructor(
    private aeropuertoService: AeropuertoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onBuscarInput(): void {
    this.seleccionRealizada = false;
    clearTimeout(this.debounceTimer);

    if (this.textoBusqueda.trim().length < 3) {
      this.sugerencias = [];
      return;
    }

    // Debounce de 500ms para no saturar Nominatim mientras el usuario escribe
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
    this.aeropuertoService.create(this.aeropuerto).subscribe(() => {
      this.router.navigate(['/dashboard/aeropuerto/list']);
    });
  }
}