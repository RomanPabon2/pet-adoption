import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected kpis = [
    { label: 'Refugios activos', value: 8 },
    { label: 'Mascotas en adopcion', value: 142 },
    { label: 'Solicitudes pendientes', value: 27 },
    { label: 'Donaciones del mes (Bs)', value: 12540 }
  ];

  protected apiMessage = '';

  constructor(private readonly api: ApiService) {
    if (this.api.getSession()) {
      this.loadBackendStats();
    }
  }

  private loadBackendStats(): void {
    forkJoin({
      refugios: this.api.getRefugios(),
      mascotas: this.api.getMascotas()
    }).subscribe({
      next: ({ refugios, mascotas }) => {
        this.kpis = [
          { label: 'Refugios activos', value: refugios.filter((refugio) => refugio.estado_ref).length },
          { label: 'Mascotas registradas', value: mascotas.length },
          { label: 'Solicitudes locales', value: this.localCount('adoptions') },
          { label: 'Donaciones locales', value: this.localCount('donations') }
        ];
      },
      error: (error: { error?: { message?: string } }) => {
        this.apiMessage = error.error?.message ?? 'Inicia sesion con permisos para ver metricas del backend.';
      }
    });
  }

  private localCount(key: string): number {
    try {
      return (JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[]).length;
    } catch {
      return 0;
    }
  }
}
