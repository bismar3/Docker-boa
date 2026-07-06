import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AeronaveService, ClaseConfig } from '../service/aeronave.service';
import { TipoClaseService } from '../../tipo-clase/service/tipo-clase.service';
import { TipoClase } from '../../../interfaces/tipo-clase.interface';

interface FilaClase extends ClaseConfig {
  id: number; // identificador interno solo para el *ngFor, no se manda al backend
}

@Component({
  selector: 'app-aeronave-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './aeronave-add.component.html',
  styleUrls: ['./aeronave-add.component.css']
})
export class AeronaveAddComponent implements OnInit {
  matricula: string = '';
  modelo: string = '';
  fabricante: string = '';
  estado: string = 'Activa';

  tiposClase: TipoClase[] = [];
  filas: FilaClase[] = [];
  private contadorId: number = 0;

  guardando: boolean = false;

  constructor(
    private aeronaveService: AeronaveService,
    private tipoClaseService: TipoClaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tipoClaseService.getAll().subscribe(data => {
      this.tiposClase = data;
      this.cdr.markForCheck();
    });

    this.agregarFila();
  }

  agregarFila(): void {
    this.filas.push({
      id: this.contadorId++,
      tipo_Clase_Id: 0,
      cantidad: 0,
      columnas_Por_Fila: 3
    });
  }

  quitarFila(id: number): void {
    this.filas = this.filas.filter(f => f.id !== id);
  }

  get totalAsientos(): number {
    return this.filas.reduce((acc, f) => acc + (f.cantidad || 0), 0);
  }

  getNombreClase(tipoClaseId: number): string {
    const t = this.tiposClase.find(tc => tc.id === tipoClaseId);
    return t ? t.nombre : '';
  }

  save(): void {
    if (!this.matricula.trim() || !this.modelo.trim()) {
      alert('Completá Matrícula y Modelo');
      return;
    }

    const filasValidas = this.filas.filter(f => f.tipo_Clase_Id > 0 && f.cantidad > 0);
    if (filasValidas.length === 0) {
      alert('Agregá al menos una clase con cantidad de asientos válida');
      return;
    }

    const dto = {
      matricula: this.matricula,
      modelo: this.modelo,
      fabricante: this.fabricante,
      estado: this.estado,
      clases: filasValidas.map(f => ({
        tipo_Clase_Id: f.tipo_Clase_Id,
        cantidad: f.cantidad,
        columnas_Por_Fila: f.columnas_Por_Fila
      }))
    };

    this.guardando = true;
    this.aeronaveService.createConAsientos(dto).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/aeronave/list']);
      },
      error: (err) => {
        this.guardando = false;
        console.error('Error al crear aeronave:', err);
        alert('Error al crear la aeronave. Revisá la consola para más detalles.');
        this.cdr.markForCheck();
      }
    });
  }
}