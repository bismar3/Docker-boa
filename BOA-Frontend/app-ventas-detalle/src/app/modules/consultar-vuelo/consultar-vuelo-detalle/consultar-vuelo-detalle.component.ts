import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-consultar-vuelo-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultar-vuelo-detalle.component.html',
  styleUrl: './consultar-vuelo-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsultarVueloDetalleComponent implements OnInit {
  vuelo: any = null;
  programacionId: number = 0;
  asientos: any[] = [];
  ventas: any[] = [];
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.programacionId = Number(this.route.snapshot.paramMap.get('id'));
    this.vuelo = history.state.vuelo;
    this.load();
  }

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  load(): void {
    forkJoin({
      asientos: this.http.get<any[]>(
        `${environment.URL_SERVICIOS}/asiento/programacion/${this.programacionId}`,
        { headers: this.getHeaders() }
      ),
      ventas: this.http.get<any[]>(
        `${environment.URL_SERVICIOS}/venta/detalle`,
        { headers: this.getHeaders() }
      )
    }).subscribe(({ asientos, ventas }) => {
      this.asientos = asientos;
      this.ventas = ventas.filter(v =>
        v.programacion_Vuelo_Id === this.programacionId && v.estado === 'Confirmada'
      );
      this.cargando = false;
      this.cdr.markForCheck();
    });
  }

  get totalAsientos(): number {
    return this.asientos.length;
  }

  get asientosOcupados(): number {
    return this.asientos.filter(a => a.estado === 'Ocupado').length;
  }

  get asientosDisponibles(): number {
    return this.asientos.filter(a => a.estado === 'Disponible').length;
  }

  get porcentajeOcupacion(): number {
    if (this.totalAsientos === 0) return 0;
    return Math.round((this.asientosOcupados / this.totalAsientos) * 100);
  }

  getPasajeroPorAsiento(asientoId: number): any {
    return this.ventas.find(v => v.asiento_Id === asientoId);
  }

  volver(): void {
    this.router.navigate(['/dashboard/consultar-vuelo/list']);
  }
}