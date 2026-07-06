import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProgramacionVueloService } from '../service/programacion-vuelo.service';
import { AeronaveService } from '../../aeronave/service/aeronave.service';
import { RutaService } from '../../ruta/service/ruta.service';
import { RutaTramoService } from '../../ruta/service/ruta-tramo.service';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { ProgramacionVuelo } from '../../../interfaces/programacion-vuelo.interface';
import { Aeronave } from '../../../interfaces/aeronave.interface';
import { Ruta } from '../../../interfaces/ruta.interface';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

interface TramoDetalle {
  orden: number;
  origen: string;
  destino: string;
}

@Component({
  selector: 'app-programacion-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './programacion-view.component.html',
  styleUrls: ['./programacion-view.component.css']
})
export class ProgramacionViewComponent implements OnInit {
  programacion: ProgramacionVuelo | null = null;
  aeronave: Aeronave | null = null;
  ruta: Ruta | null = null;
  aeropuertos: Aeropuerto[] = [];
  tramos: TramoDetalle[] = [];
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private programacionService: ProgramacionVueloService,
    private aeronaveService: AeronaveService,
    private rutaService: RutaService,
    private rutaTramoService: RutaTramoService,
    private aeropuertoService: AeropuertoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({
      programacion: this.programacionService.getById(id),
      aeropuertos: this.aeropuertoService.getAll(),
      aeronaves: this.aeronaveService.getAll(),
      rutas: this.rutaService.getAll()
    }).subscribe(({ programacion, aeropuertos, aeronaves, rutas }) => {
      this.programacion = programacion;
      this.aeropuertos = aeropuertos;
      this.aeronave = aeronaves.find(a => a.id === programacion.aeronave_Id) || null;
      this.ruta = rutas.find(r => r.id === programacion.ruta_Id) || null;

      if (this.ruta) {
        this.rutaTramoService.getByRutaId(this.ruta.id!).subscribe(rts => {
          this.tramos = rts
            .sort((a, b) => a.orden - b.orden)
            .map(rt => {
              const o = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Origen_Id);
              const d = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Destino_Id);
              return {
                orden: rt.orden,
                origen: o ? `${o.ciudad} (${o.codigo_IATA})` : '?',
                destino: d ? `${d.ciudad} (${d.codigo_IATA})` : '?'
              };
            });
          this.cargando = false;
          this.cdr.markForCheck();
        });
      } else {
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  getNombreAeropuerto(id?: number): string {
    if (!id) return '?';
    const a = this.aeropuertos.find(a => a.id === id);
    return a ? `${a.nombre} (${a.codigo_IATA})` : `ID: ${id}`;
  }
}