import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reportes-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-dashboard.component.html',
  styleUrl: './reportes-dashboard.component.css'
})
export class ReportesDashboardComponent {
  constructor(private router: Router) {}

  irA(ruta: string): void {
    switch (ruta) {
      case 'vuelos':
        this.router.navigate(['/dashboard/reportes/ocupacion']);
        break;
      case 'ventas':
        this.router.navigate(['/dashboard/reportes/ventas']);
        break;
      case 'ingresos':
        this.router.navigate(['/dashboard/reportes/financiero']);
        break;
      case 'egresos':
        this.router.navigate(['/dashboard/reportes/financiero']);
        break;
    }
  }
}