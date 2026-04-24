import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected readonly kpis = [
    { label: 'Refugios activos', value: 8 },
    { label: 'Mascotas en adopcion', value: 142 },
    { label: 'Solicitudes pendientes', value: 27 },
    { label: 'Donaciones del mes (Bs)', value: 12540 }
  ];
}
