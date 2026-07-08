import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AeropuertoService } from '../../aeropuerto/service/aeropuerto.service';
import { RutaTramoService } from '../../ruta/service/ruta-tramo.service';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';
import { environment } from '../../../../environments/environment.development';
import { ThemeService } from '../../../shared/services/theme.service';

interface TramoInfo {
  esRaiz: boolean;
  origen: string;
  destino: string;
  duracion: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent implements OnInit, AfterViewInit {
  aeropuertos: Aeropuerto[] = [];

  origenTexto: string = '';
  destinoTexto: string = '';
  fecha: string = '';
  clase: string = 'Economica';

  adultos: number = 1;
  ninos: number = 0;
  mostrarPasajeros: boolean = false;
  mostrarClase: boolean = false;
  mostrarMenuTema: boolean = false;

  sugerenciasOrigen: Aeropuerto[] = [];
  sugerenciasDestino: Aeropuerto[] = [];
  origenSeleccionado: Aeropuerto | null = null;
  destinoSeleccionado: Aeropuerto | null = null;

  vuelosEncontrados: any[] = [];
  buscando: boolean = false;
  buscado: boolean = false;

  // --- Ver escalas ---
  escalasExpandidas = new Set<number>();
  escalasCache: { [programacionId: number]: TramoInfo[] } = {};
  cargandoEscalas = new Set<number>();

  constructor(
    private aeropuertoService: AeropuertoService,
    private rutaTramoService: RutaTramoService,
    private router: Router,
    private http: HttpClient,
    public themeService: ThemeService,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.aeropuertoService.getAllPublic().subscribe(data => {
      this.aeropuertos = data;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.themeService.applyTheme(), 0);
  }

  toggleMenuTema(): void {
    this.mostrarMenuTema = !this.mostrarMenuTema;
  }

  cerrarMenuTema(): void {
    this.mostrarMenuTema = false;
  }

  setColor(color: 'blue' | 'orange' | 'green'): void {
    this.themeService.setColor(color);
  }

  toggleModo(): void {
    this.themeService.toggleMode();
  }

  filtrarOrigen(): void {
    const texto = this.origenTexto.toLowerCase();
    this.origenSeleccionado = null;
    this.sugerenciasOrigen = texto.length > 1
      ? this.aeropuertos.filter(a =>
          a.ciudad.toLowerCase().includes(texto) ||
          a.pais.toLowerCase().includes(texto) ||
          a.codigo_IATA.toLowerCase().includes(texto) ||
          a.nombre.toLowerCase().includes(texto)
        ).slice(0, 5)
      : [];
    this.cdr.markForCheck();
  }

  filtrarDestino(): void {
    const texto = this.destinoTexto.toLowerCase();
    this.destinoSeleccionado = null;
    this.sugerenciasDestino = texto.length > 1
      ? this.aeropuertos.filter(a =>
          a.ciudad.toLowerCase().includes(texto) ||
          a.pais.toLowerCase().includes(texto) ||
          a.codigo_IATA.toLowerCase().includes(texto) ||
          a.nombre.toLowerCase().includes(texto)
        ).slice(0, 5)
      : [];
    this.cdr.markForCheck();
  }

  seleccionarOrigen(a: Aeropuerto): void {
    this.origenSeleccionado = a;
    this.origenTexto = `${a.ciudad} (${a.codigo_IATA})`;
    this.sugerenciasOrigen = [];
    this.cdr.markForCheck();
  }

  seleccionarDestino(a: Aeropuerto): void {
    this.destinoSeleccionado = a;
    this.destinoTexto = `${a.ciudad} (${a.codigo_IATA})`;
    this.sugerenciasDestino = [];
    this.cdr.markForCheck();
  }

  seleccionarClase(c: string): void {
    this.clase = c;
    this.mostrarClase = false;
    this.cdr.markForCheck();
  }

  get totalPasajeros(): string {
    const total = this.adultos + this.ninos;
    return `${total} pasajero${total !== 1 ? 's' : ''}`;
  }

  cambiarAdultos(delta: number): void {
    const nuevoTotal = this.adultos + delta + this.ninos;
    if (nuevoTotal > 3) return;
    this.adultos = Math.max(1, this.adultos + delta);
    this.cdr.markForCheck();
  }

  cambiarNinos(delta: number): void {
    const nuevoTotal = this.adultos + this.ninos + delta;
    if (nuevoTotal > 3) return;
    this.ninos = Math.max(0, this.ninos + delta);
    this.cdr.markForCheck();
  }

  buscar(): void {
    if (!this.origenSeleccionado || !this.destinoSeleccionado) {
      alert('Selecciona origen y destino de la lista de sugerencias');
      return;
    }

    this.buscando = true;
    this.buscado = false;
    this.vuelosEncontrados = [];
    this.escalasExpandidas.clear();
    this.escalasCache = {};
    this.cdr.markForCheck();

    const token = sessionStorage.getItem('token') || '';
    const headers = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<any[]>(
      `${environment.URL_SERVICIOS}/programacionvuelo/buscar?origen=${this.origenSeleccionado.id}&destino=${this.destinoSeleccionado.id}`,
      { headers }
    ).subscribe({
      next: (data) => {
        this.vuelosEncontrados = this.filtrarPorFecha(data);
        this.buscando = false;
        this.buscado = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.vuelosEncontrados = [];
        this.buscando = false;
        this.buscado = true;
        this.cdr.markForCheck();
      }
    });
  }

  private filtrarPorFecha(vuelos: any[]): any[] {
    if (!this.fecha) return vuelos;

    const fechaSolicitada = new Date(this.fecha + 'T23:59:59');

    const conFechaParseada = vuelos.map(v => {
      const partes = v.fecha_Salida.split(' ')[0].split('/');
      const dia = partes[0].padStart(2, '0');
      const mes = partes[1].padStart(2, '0');
      const anio = partes[2];
      const fechaVuelo = new Date(`${anio}-${mes}-${dia}T00:00:00`);
      return { vuelo: v, fechaVuelo };
    });

    const validos = conFechaParseada.filter(x => x.fechaVuelo <= fechaSolicitada);

    if (validos.length === 0) return [];

    const fechaMasCercana = Math.max(...validos.map(x => x.fechaVuelo.getTime()));

    return validos
      .filter(x => x.fechaVuelo.getTime() === fechaMasCercana)
      .map(x => x.vuelo);
  }

  buscarPorDestino(ciudad: string): void {
    const destino = this.aeropuertos.find(a =>
      a.ciudad.toLowerCase().includes(ciudad.toLowerCase())
    );
    if (destino) {
      this.destinoSeleccionado = destino;
      this.destinoTexto = `${destino.ciudad} (${destino.codigo_IATA})`;
      this.cdr.markForCheck();
    }
    this.router.navigate(['/auth/login']);
  }

  seleccionarVuelo(vuelo: any): void {
    const token = sessionStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem('vuelo_pendiente', JSON.stringify(vuelo));
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/dashboard/cliente/seleccionar-asiento', vuelo.programacionId], {
      state: { vuelo }
    });
  }

  getCiudad(id: number): string {
    return this.aeropuertos.find(a => a.id === id)?.ciudad || '?';
  }

  getCodigoIATA(id: number): string {
    return this.aeropuertos.find(a => a.id === id)?.codigo_IATA || '?';
  }

  estaExpandido(vuelo: any): boolean {
    return this.escalasExpandidas.has(vuelo.programacionId);
  }

  estaCargandoEscalas(vuelo: any): boolean {
    return this.cargandoEscalas.has(vuelo.programacionId);
  }

  getEscalasDe(vuelo: any): TramoInfo[] {
    return this.escalasCache[vuelo.programacionId] || [];
  }

  toggleVerEscalas(vuelo: any): void {
    const id = vuelo.programacionId;

    if (this.escalasExpandidas.has(id)) {
      this.escalasExpandidas.delete(id);
      this.cdr.markForCheck();
      return;
    }

    this.escalasExpandidas.add(id);

    if (this.escalasCache[id]) {
      this.cdr.markForCheck();
      return;
    }

    this.cargandoEscalas.add(id);
    this.cdr.markForCheck();

    this.rutaTramoService.getByRutaIdPublic(vuelo.ruta_Id).subscribe(rts => {
      const rtsOrdenados = rts.sort((a, b) => a.orden - b.orden);

      const tramosInfo: TramoInfo[] = rtsOrdenados.map(rt => {
        const o = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Origen_Id);
        const d = this.aeropuertos.find(a => a.id === rt.tramo?.aeropuerto_Destino_Id);
        return {
          esRaiz: !rt.tramo?.tramo_Padre_Id,
          origen: o ? `${o.ciudad} (${o.codigo_IATA})` : '?',
          destino: d ? `${d.ciudad} (${d.codigo_IATA})` : '?',
          duracion: rt.tramo?.duracion_Estimada || '--'
        };
      });

      this.escalasCache[id] = tramosInfo;
      this.cargandoEscalas.delete(id);
      this.cdr.markForCheck();
    });
  }

  irRegistro(): void {
    this.router.navigate(['/auth/registro']);
  }

  irLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}