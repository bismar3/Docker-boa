import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TipoClaseService } from '../service/tipo-clase.service';
import { TipoClase } from '../../../interfaces/tipo-clase.interface';

@Component({
  selector: 'app-tipo-clase-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tipo-clase-list.component.html',
  styleUrls: ['./tipo-clase-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TipoClaseListComponent implements OnInit {
  tipoClases: TipoClase[] = [];
  constructor(private tipoClaseService: TipoClaseService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.tipoClaseService.getAll().subscribe(data => {
      this.tipoClases = data;
      this.cdr.markForCheck();
    });
  }
  delete(id: number): void {
    if (confirm('¿Eliminar este tipo de clase?')) {
      this.tipoClaseService.delete(id).subscribe(() => this.load());
    }
  }
}