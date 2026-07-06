import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ProgramacionVueloService } from '../service/programacion-vuelo.service';
import { RutaService } from '../../ruta/service/ruta.service';
import { ProgramacionVuelo } from '../../../interfaces/programacion-vuelo.interface';

@Component({
  selector: 'app-programacion-reprogramar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './programacion-reprogramar.component.html',
  styleUrls: ['./programacion-reprogramar.component.css']
})
export class ProgramacionReprogramarComponent implements OnInit {
  programacionId: number = 0;
  programacion: ProgramacionVuelo | null = null;
  motivo: string = '';
  cargando: boolean = true;
  calculandoLlegada: boolean = false;
  llegadaCalculada: boolean = false;
  private cargaInicialCompleta: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private programacionService: ProgramacionVueloService,
    private rutaService: RutaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.programacionId = Number(this.route.snapshot.paramMap.get('id'));
    this.programacionService.getById(this.programacionId).subscribe(data => {
      this.programacion = {
        ...data,
        fecha_Salida: this.soloFecha(data.fecha_Salida),
        hora_Salida: this.soloHora(data.hora_Salida),
        fecha_Llegada: this.soloFecha(data.fecha_Llegada),
        hora_Llegada: this.soloHora(data.hora_Llegada)
      };
      this.cargando = false;
      this.cdr.markForCheck();

      setTimeout(() => { this.cargaInicialCompleta = true; }, 0);
    });
  }

  private soloFecha(valor: string): string {
    if (!valor) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
      return valor.substring(0, 10);
    }
    const soloFechaParte = valor.split(' ')[0];
    const partes = soloFechaParte.split('/');
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    return '';
  }

  private soloHora(valor: string): string {
    if (!valor) return '';
    return valor.substring(0, 5);
  }

  onFechaHoraSalidaChange(): void {
    if (!this.cargaInicialCompleta || !this.programacion) return;

    this.llegadaCalculada = false;

    if (!this.programacion.ruta_Id || !this.programacion.fecha_Salida || !this.programacion.hora_Salida) {
      return;
    }

    this.calculandoLlegada = true;
    this.cdr.markForCheck();

    this.rutaService.calcularLlegada(
      this.programacion.ruta_Id,
      this.programacion.fecha_Salida,
      this.programacion.hora_Salida
    ).subscribe(resultado => {
      this.calculandoLlegada = false;

      if (resultado && this.programacion) {
        this.programacion.fecha_Llegada = resultado.fechaLlegada;
        this.programacion.hora_Llegada = resultado.horaLlegada;
        this.llegadaCalculada = true;
      }

      this.cdr.markForCheck();
    });
  }

  guardar(): void {
    if (!this.programacion) return;

    if (!this.motivo.trim()) {
      alert('Debes ingresar un motivo de reprogramación');
      return;
    }

    const actualizado: ProgramacionVuelo = {
      ...this.programacion,
      id: this.programacionId,
      estado: 'Reprogramado',
      motivo_Reprogramacion: this.motivo
    };

    this.programacionService.update(actualizado).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/programacion-vuelo/list']);
      },
      error: (err) => {
        console.error('Error al reprogramar:', err);
        alert('Error al reprogramar. Revisá la consola.');
      }
    });
  }
}