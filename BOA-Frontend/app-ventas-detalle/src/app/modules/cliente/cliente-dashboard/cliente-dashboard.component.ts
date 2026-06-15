import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClienteDashboardComponent implements OnInit {
  nombreUsuario: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.nombreUsuario = user.user?.fullname || 'Cliente';
    this.cdr.markForCheck();
  }
}