import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AeronaveService } from '../service/aeronave.service';
import { Aeronave } from '../../../interfaces/aeronave.interface';

@Component({
  selector: 'app-aeronave-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aeronave-list.component.html',
  styleUrls: ['./aeronave-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeronaveListComponent implements OnInit {
  aeronaves: Aeronave[] = [];
  constructor(private aeronaveService: AeronaveService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.aeronaveService.getAll().subscribe(data => {
      this.aeronaves = data;
      this.cdr.markForCheck();
    });
  }
  delete(id: number): void {
    if (confirm('¿Eliminar esta aeronave?')) {
      this.aeronaveService.delete(id).subscribe(() => this.load());
    }
  }
}