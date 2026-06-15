import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AeronaveService } from '../service/aeronave.service';
import { Aeronave } from '../../../interfaces/aeronave.interface';

@Component({
  selector: 'app-aeronave-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './aeronave-add.component.html',
  styleUrls: ['./aeronave-add.component.css']
})
export class AeronaveAddComponent {
  aeronave: Aeronave = { matricula: '', modelo: '', fabricante: '', capacidad_total: 0, estado: 'Activa' };
  constructor(private aeronaveService: AeronaveService, private router: Router) {}
  save(): void {
    this.aeronaveService.create(this.aeronave).subscribe(() => {
      this.router.navigate(['/dashboard/aeronave/list']);
    });
  }
}