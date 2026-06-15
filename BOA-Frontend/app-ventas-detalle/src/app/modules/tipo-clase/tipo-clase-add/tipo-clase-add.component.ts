import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TipoClaseService } from '../service/tipo-clase.service';
import { TipoClase } from '../../../interfaces/tipo-clase.interface';

@Component({
  selector: 'app-tipo-clase-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tipo-clase-add.component.html',
  styleUrls: ['./tipo-clase-add.component.css']
})
export class TipoClaseAddComponent {
  tipoClase: TipoClase = { nombre: '', descripcion: '', caracteristicas: '', multiplicador_precio: 1.00 };
  constructor(private tipoClaseService: TipoClaseService, private router: Router) {}
  save(): void {
    this.tipoClaseService.create(this.tipoClase).subscribe(() => {
      this.router.navigate(['/dashboard/tipo-clase/list']);
    });
  }
}