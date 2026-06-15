import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AeropuertoService } from '../service/aeropuerto.service';
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
    pais: ''
  };

  constructor(
    private aeropuertoService: AeropuertoService,
    private router: Router
  ) {}

  save(): void {
    this.aeropuertoService.create(this.aeropuerto).subscribe(() => {
      this.router.navigate(['/dashboard/aeropuerto/list']);
    });
  }
}