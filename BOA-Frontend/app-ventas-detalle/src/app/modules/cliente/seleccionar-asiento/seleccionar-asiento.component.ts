import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

interface AsientoProg {
  id: number;
  asiento_Id: number;
  programacion_Vuelo_Id: number;
  estado: string;
  asiento: {
    id: number;
    numero: string;
    fila: number;
    tipo_Clase_Id: number;
    tipoClase: {
      id: number;
      nombre: string;
      multiplicador_Precio: number;
    }
  }
}

@Component({
  selector: 'app-seleccionar-asiento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seleccionar-asiento.component.html',
  styleUrls: ['./seleccionar-asiento.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeleccionarAsientoComponent implements OnInit {
  programacionId: number = 0;
  vuelo: any = null;
  asientos: AsientoProg[] = [];
  asientoSeleccionado: AsientoProg | null = null;
  filtroClase: number = 0;
  clases: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.programacionId = Number(this.route.snapshot.paramMap.get('id'));
    this.vuelo = history.state.vuelo;
    this.cargarAsientos();
  }

  cargarAsientos(): void {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<AsientoProg[]>(
      `${environment.URL_SERVICIOS}/asiento/programacion/${this.programacionId}`,
      { headers }
    ).subscribe(data => {
      this.asientos = data;
      const clasesMap = new Map();
      data.forEach(a => {
        if (!clasesMap.has(a.asiento.tipoClase.id)) {
          clasesMap.set(a.asiento.tipoClase.id, a.asiento.tipoClase);
        }
      });
      this.clases = Array.from(clasesMap.values());
      this.cdr.markForCheck();
    });
  }

  get asientosFiltrados(): AsientoProg[] {
    if (this.filtroClase === 0) return this.asientos;
    return this.asientos.filter(a => a.asiento.tipo_Clase_Id === this.filtroClase);
  }

  getFilas(): number[] {
    const filas = [...new Set(this.asientosFiltrados.map(a => a.asiento.fila))];
    return filas.sort((a, b) => a - b);
  }

  getAsientosPorFila(fila: number): AsientoProg[] {
    return this.asientosFiltrados
      .filter(a => a.asiento.fila === fila)
      .sort((a, b) => a.asiento.numero.localeCompare(b.asiento.numero));
  }

  getColorAsiento(asiento: AsientoProg): string {
    if (this.asientoSeleccionado?.id === asiento.id) return 'bg-yellow-500 text-black';
    if (asiento.estado === 'Ocupado') return 'bg-red-700 text-white cursor-not-allowed opacity-60';
    if (asiento.estado === 'Bloqueado') return 'bg-gray-600 text-white cursor-not-allowed opacity-60';
    const clase = asiento.asiento.tipo_Clase_Id;
    if (clase === 1) return 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer';
    if (clase === 2) return 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer';
    return 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer';
  }

  seleccionar(asiento: AsientoProg): void {
    if (asiento.estado !== 'Disponible') return;
    this.asientoSeleccionado = asiento;
    this.cdr.markForCheck();
  }

  getPrecio(): number {
    if (!this.vuelo || !this.asientoSeleccionado) return 0;
    return this.vuelo.precio_Base * this.asientoSeleccionado.asiento.tipoClase.multiplicador_Precio;
  }

  continuar(): void {
    if (!this.asientoSeleccionado) return;
    this.router.navigate(['/dashboard/cliente/datos-pasajeros'], {
      state: {
        vuelo: this.vuelo,
        asiento: this.asientoSeleccionado,
        precio: this.getPrecio()
      }
    });
  }
}