import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AeropuertoService } from '../service/aeropuerto.service';
import { Aeropuerto } from '../../../interfaces/aeropuerto.interface';

@Component({
  selector: 'app-aeropuerto-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aeropuerto-list.component.html',
  styleUrls: ['./aeropuerto-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeropuertoListComponent implements OnInit {
  aeropuertos: Aeropuerto[] = [];

  constructor(
    private aeropuertoService: AeropuertoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAeropuertos();
  }

  loadAeropuertos(): void {
    this.aeropuertoService.getAll().subscribe(data => {
      this.aeropuertos = data;
      this.cdr.markForCheck();
    });
  }

  delete(id: number): void {
    if (confirm('¿Está seguro de eliminar este aeropuerto?')) {
      this.aeropuertoService.delete(id).subscribe(() => {
        this.loadAeropuertos();
      });
    }
  }
}